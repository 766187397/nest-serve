import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: true, // 允许跨域
  namespace: "/notice", // 命名空间（可选）
})
export class NoticeWS implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server; // 访问 Socket.io  服务端实例

  // 客户端连接时触发
  handleConnection(client: Socket) {
    console.log(`客户端连接时触发: ${client.id}`);
  }

  // 客户端断开时触发
  handleDisconnect(client: Socket) {
    console.log(`客户端断开时触发: ${client.id}`);
  }

  // 处理前端发送的 "message" 事件
  @SubscribeMessage("message")
  handleMessage(client: Socket, payload: any): void {
    console.log("payload", payload);
    // 广播消息给所有客户端（包括发送者）
    this.server.emit("message", payload);

    // 仅回复发送者（可选）
    // client.emit('ack',  { status: 'Message received' });
  }

  // 1. 推送给所有客户端
  broadcastAlert(message: string) {
    this.server.emit("alert", { message });
  }

  // 2. 推送给特定房间
  notifyRoom(roomId: string, data: any) {
    this.server.to(roomId).emit("room_msg", data);
  }

  // 3. 推送给单个客户端 (通过SocketID)
  notifyUser(socketId: string, data: any) {
    this.server.to(socketId).emit("private", data);
  }
}
