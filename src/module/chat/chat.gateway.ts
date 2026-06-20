import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedCustomers = new Set<number>();

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const customerId = (client as any).customerId;
    if (customerId) {
      this.connectedCustomers.delete(customerId);
      this.server.to('admin').emit('customerStatusChange', { customerId, online: false });
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.room);
    console.log(`Client ${client.id} joined room: ${data.room}`);
    
    if (data.room.startsWith('customer_')) {
      const customerId = parseInt(data.room.split('_')[1]);
      if (!isNaN(customerId)) {
        this.connectedCustomers.add(customerId);
        (client as any).customerId = customerId;
        this.server.to('admin').emit('customerStatusChange', { customerId, online: true });

        const history = await this.chatService.getMessagesByCustomer(customerId);
        client.emit('chatHistory', history);
      }
    } else if (data.room === 'admin') {
      const activeCustomers = await this.chatService.getActiveCustomers();
      const mappedCustomers = activeCustomers.map(c => ({
        ...c,
        online: this.connectedCustomers.has(c.id)
      }));
      client.emit('activeCustomers', mappedCustomers);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { customerId: number; text: string; senderType: 'customer' | 'admin'; senderId?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const savedMessage = await this.chatService.saveMessage({
      customerId: data.customerId,
      text: data.text,
      senderType: data.senderType,
      senderId: data.senderId,
    });

    this.server.to(`customer_${data.customerId}`).emit('newMessage', savedMessage);
    
    if (data.senderType === 'customer') {
      this.server.to('admin').emit('newMessage', savedMessage);
    }
  }
  @SubscribeMessage('deleteChat')
  async handleDeleteChat(
    @MessageBody() data: { customerId: number },
    @ConnectedSocket() client: Socket,
  ) {
    await this.chatService.deleteChatByCustomer(data.customerId);
    this.server.to(`customer_${data.customerId}`).emit('chatDeleted', { customerId: data.customerId });
    this.server.to('admin').emit('chatDeleted', { customerId: data.customerId });
  }
}
