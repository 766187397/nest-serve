import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { NoticeService } from './notice.service';

interface WsMessagePayload {
  token: string;
}

@WebSocketGateway({
  cors: true, // 允许跨域
  namespace: '/api/v1/admin/notice/ws', // 命名空间（可选）
})
export class NoticeWS implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NoticeWS.name);
  constructor(private readonly noticeService: NoticeService) {}
  @WebSocketServer() server: Server; // 访问 Socket.io  服务端实例

  // 客户端连接时触发
  async handleConnection(client: Socket) {
    this.logger.log(`客户端连接时触发: ${client.id}`);
    const token = client.handshake.query.token as string;
    const data = await this.noticeService.handleWsFindUserOrRole(token, 'admin');
    client.emit('list', data);
  }

  // 客户端断开时触发
  handleDisconnect(client: Socket) {
    this.logger.log(`客户端断开时触发: ${client.id}`);
  }

  // 处理前端发送的 "message" 事件
  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: WsMessagePayload) {
    this.logger.log('payload', payload);
    const token = payload.token;

    const data = await this.noticeService.handleWsFindUserOrRole(token, 'admin');
    // 广播消息给所有客户端（包括发送者）
    // this.server.emit("message", payload);

    // 仅回复发送者（可选）
    client.emit('list', data);
  }

  // 1. 推送给所有客户端
  broadcastAlert(message: string) {
    this.logger.log('推送给所有客户端', message);
    this.server.emit('update', { message });
  }

  // 2. 推送给特定房间
  notifyRoom(roomId: string, data: unknown) {
    this.server.to(roomId).emit('room_msg', data);
  }

  // 3. 推送给单个客户端 (通过SocketID)
  notifyUser(socketId: string, data: unknown) {
    this.server.to(socketId).emit('private', data);
  }
}
