# WebSocket通信

WebSocket是一种在单个TCP连接上进行全双工通信的协议，允许服务器主动向客户端推送数据。在本章节中，我们将实现WebSocket通信功能，用于实时消息推送和在线状态管理。

## 1. 安装WebSocket依赖

首先，我们需要安装NestJS的WebSocket模块和Socket.io依赖：

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io-client
```

## 2. 创建WebSocket网关

WebSocket网关是处理WebSocket连接的核心组件，负责处理客户端连接、消息收发和断开连接等事件。

### 2.1 创建WebSocket网关文件

```typescript
// src/gateways/chat.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

// 装饰器声明这是一个WebSocket网关，指定命名空间为'chat'
@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  // 注入WebSocket服务器实例
  @WebSocketServer() server: Server;
  
  // 日志记录器
  private logger: Logger = new Logger('ChatGateway');
  
  // 存储在线用户信息
  private onlineUsers: Map<string, string> = new Map();

  // 网关初始化完成时调用
  afterInit(server: Server) {
    this.logger.log('WebSocket网关初始化完成');
  }

  // 客户端连接时调用
  handleConnection(client: Socket) {
    this.logger.log(`客户端连接: ${client.id}`);
    // 发送在线用户列表给新连接的客户端
    client.emit('onlineUsers', Array.from(this.onlineUsers.entries()));
  }

  // 客户端断开连接时调用
  handleDisconnect(client: Socket) {
    this.logger.log(`客户端断开连接: ${client.id}`);
    // 从在线用户列表中移除
    const username = this.onlineUsers.get(client.id);
    if (username) {
      this.onlineUsers.delete(client.id);
      // 广播用户离线消息
      this.server.emit('userOffline', { username, clientId: client.id });
    }
  }

  // 订阅'joinChat'消息
  @SubscribeMessage('joinChat')
  handleJoinChat(client: Socket, payload: { username: string }) {
    // 存储用户信息
    this.onlineUsers.set(client.id, payload.username);
    // 广播新用户加入消息
    this.server.emit('userOnline', { username: payload.username, clientId: client.id });
    // 返回确认消息给发送者
    return { event: 'joined', data: { username: payload.username, message: '成功加入聊天室' } };
  }

  // 订阅'sendMessage'消息
  @SubscribeMessage('sendMessage')
  handleSendMessage(client: Socket, payload: { message: string }) {
    const username = this.onlineUsers.get(client.id);
    if (username) {
      // 广播消息给所有客户端
      this.server.emit('newMessage', {
        username,
        message: payload.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 订阅'typing'消息
  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: { isTyping: boolean }) {
    const username = this.onlineUsers.get(client.id);
    if (username) {
      // 广播输入状态给其他客户端
      client.broadcast.emit('userTyping', {
        username,
        isTyping: payload.isTyping
      });
    }
  }
}
```

### 2.2 注册WebSocket网关

在模块中注册WebSocket网关：

```typescript
// src/modules/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { ChatGateway } from '../../gateways/chat.gateway';

@Module({
  providers: [ChatGateway],
})
export class ChatModule {}
```

然后在主模块中导入ChatModule：

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    // 其他模块
    ChatModule,
  ],
})
export class AppModule {}
```

## 3. 创建WebSocket服务

为了更好地管理WebSocket相关业务逻辑，我们创建一个WebSocket服务：

```typescript
// src/services/websocket.service.ts
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class WebSocketService {
  private server: Server;
  
  // 设置服务器实例
  setServer(server: Server) {
    this.server = server;
  }
  
  // 向指定命名空间的所有客户端发送消息
  emitToNamespace(namespace: string, event: string, data: any) {
    if (this.server) {
      this.server.of(namespace).emit(event, data);
    }
  }
  
  // 向指定房间的客户端发送消息
  emitToRoom(namespace: string, room: string, event: string, data: any) {
    if (this.server) {
      this.server.of(namespace).to(room).emit(event, data);
    }
  }
  
  // 向指定客户端发送消息
  emitToClient(clientId: string, event: string, data: any) {
    if (this.server) {
      this.server.to(clientId).emit(event, data);
    }
  }
  
  // 加入房间
  joinRoom(clientId: string, room: string) {
    if (this.server) {
      this.server.sockets.sockets.get(clientId)?.join(room);
    }
  }
  
  // 离开房间
  leaveRoom(clientId: string, room: string) {
    if (this.server) {
      this.server.sockets.sockets.get(clientId)?.leave(room);
    }
  }
}
```

## 4. 实现WebSocket认证

为了确保WebSocket连接的安全性，我们需要实现WebSocket认证：

```typescript
// src/guards/ws-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获取WebSocket客户端
    const client = context.switchToWs().getClient<Socket>();
    
    // 从连接参数或token中获取认证信息
    const token = this.extractTokenFromHeader(client);
    if (!token) {
      throw new WsException('未提供认证令牌');
    }
    
    try {
      // 验证JWT令牌
      const payload = await this.jwtService.verifyAsync(
        token,
        { secret: process.env.JWT_SECRET }
      );
      
      // 将用户信息存储到客户端
      client.data.user = payload;
    } catch {
      throw new WsException('无效的认证令牌');
    }
    
    return true;
  }
  
  // 从连接头或查询参数中提取令牌
  private extractTokenFromHeader(client: Socket): string | undefined {
    // 从查询参数中获取token
    const token = client.handshake.query.token as string;
    if (token) {
      return token;
    }
    
    // 从请求头中获取token
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    
    return undefined;
  }
}
```

## 5. 使用WebSocket守卫

在WebSocket网关中使用守卫：

```typescript
// src/gateways/chat.gateway.ts
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../guards/ws-auth.guard';

// 在网关级别应用守卫
@UseGuards(WsAuthGuard)
@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  // 网关实现...
}
```

## 6. 客户端连接示例

以下是使用Socket.io客户端连接WebSocket服务器的示例：

```javascript
// 前端代码示例
import { io } from 'socket.io-client';

// 创建WebSocket连接，传递认证token
const socket = io('http://localhost:3000/chat', {
  query: {
    token: 'your-jwt-token'
  }
});

// 监听连接成功事件
socket.on('connect', () => {
  console.log('WebSocket连接成功');
  
  // 发送加入聊天室消息
  socket.emit('joinChat', { username: 'testuser' });
});

// 监听新消息事件
socket.on('newMessage', (data) => {
  console.log('收到新消息:', data);
});

// 监听用户上线事件
socket.on('userOnline', (data) => {
  console.log('用户上线:', data);
});

// 监听用户下线事件
socket.on('userOffline', (data) => {
  console.log('用户下线:', data);
});

// 监听用户输入状态事件
socket.on('userTyping', (data) => {
  console.log('用户输入状态:', data);
});

// 发送消息
socket.emit('sendMessage', { message: 'Hello, World!' });

// 发送输入状态
socket.emit('typing', { isTyping: true });
```

## 7. WebSocket事件记录

为了监控和调试WebSocket通信，我们可以添加事件记录功能：

```typescript
// src/interceptors/ws-logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from '@nestjs/common';

@Injectable()
export class WsLoggingInterceptor implements NestInterceptor {
  private logger: Logger = new Logger('WsLoggingInterceptor');
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();
    const event = context.switchToWs().getEvent();
    
    this.logger.log(`WebSocket事件: ${event}, 客户端: ${client.id}, 数据: ${JSON.stringify(data)}`);
    
    const now = Date.now();
    
    return next.handle().pipe(
      tap((response) => {
        this.logger.log(`WebSocket事件响应: ${event}, 客户端: ${client.id}, 耗时: ${Date.now() - now}ms, 响应: ${JSON.stringify(response)}`);
      })
    );
  }
}
```

## 8. WebSocket测试

使用Jest和socket.io-client测试WebSocket功能：

```typescript
// test/websocket/chat.gateway.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { AppModule } from '../../src/app.module';

describe('ChatGateway', () => {
  let app: INestApplication;
  let socket: Socket;
  
  // 测试前准备
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.listen(3001);
    
    // 创建WebSocket客户端连接
    socket = io('http://localhost:3001/chat', {
      autoConnect: false,
    });
  });
  
  // 测试后清理
  afterAll(async () => {
    await socket.disconnect();
    await app.close();
  });
  
  // 测试连接
  it('should connect to the chat gateway', (done) => {
    socket.on('connect', () => {
      expect(socket.connected).toBe(true);
      done();
    });
    
    socket.connect();
  });
  
  // 测试加入聊天室
  it('should join chat room', (done) => {
    socket.emit('joinChat', { username: 'testuser' });
    
    socket.on('joined', (response) => {
      expect(response).toEqual({
        event: 'joined',
        data: { username: 'testuser', message: '成功加入聊天室' }
      });
      done();
    });
  });
  
  // 测试发送消息
  it('should send and receive messages', (done) => {
    socket.emit('sendMessage', { message: 'Hello, Test!' });
    
    socket.on('newMessage', (message) => {
      expect(message.message).toBe('Hello, Test!');
      expect(message.username).toBe('testuser');
      done();
    });
  });
});
```

## 9. WebSocket最佳实践

1. **使用命名空间**：将不同类型的WebSocket通信分离到不同的命名空间，如`/chat`、`/notification`等
2. **使用房间**：对于多用户通信，使用房间（Room）来管理用户分组
3. **认证与授权**：始终对WebSocket连接进行认证和授权
4. **错误处理**：实现完善的错误处理机制，避免单个连接错误影响整个服务器
5. **心跳检测**：实现心跳机制，检测无效连接并及时清理
6. **限流控制**：对客户端消息频率进行限制，防止恶意攻击
7. **数据验证**：对客户端发送的数据进行验证，确保数据完整性和安全性
8. **日志记录**：记录WebSocket通信日志，便于监控和调试
9. **性能优化**：合理设置WebSocket连接数和缓冲区大小，优化服务器性能
10. **优雅关闭**：在服务器关闭时，优雅地关闭所有WebSocket连接

## 10. 总结

本章节我们实现了完整的WebSocket通信功能，包括：

1. WebSocket网关的创建和配置
2. 客户端连接、消息收发和断开连接的处理
3. WebSocket认证和授权
4. WebSocket服务的创建和使用
5. 客户端连接示例
6. WebSocket测试
7. WebSocket最佳实践

WebSocket通信是现代Web应用的重要组成部分，能够实现实时消息推送、在线状态管理、实时协作等功能。在实际项目中，我们可以根据需求扩展WebSocket功能，如添加消息持久化、文件传输、视频聊天等高级功能。