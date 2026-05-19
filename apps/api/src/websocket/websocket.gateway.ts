import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/crm',
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    const tenantId = client.handshake.query.tenantId as string;
    if (tenantId) {
      client.join(`tenant:${tenantId}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(client: Socket, conversationId: string) {
    client.join(`conversation:${conversationId}`);
    return { status: 'joined', conversationId };
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(client: Socket, conversationId: string) {
    client.leave(`conversation:${conversationId}`);
    return { status: 'left', conversationId };
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, data: { conversationId: string; userId: string }) {
    client.to(`conversation:${data.conversationId}`).emit('user_typing', {
      userId: data.userId,
    });
  }

  notifyNewMessage(tenantId: string, conversationId: string, message: any) {
    this.server
      .to(`tenant:${tenantId}`)
      .to(`conversation:${conversationId}`)
      .emit('new_message', { conversationId, message });
  }

  notifyConversationUpdate(tenantId: string, conversation: any) {
    this.server
      .to(`tenant:${tenantId}`)
      .emit('conversation_updated', conversation);
  }
}
