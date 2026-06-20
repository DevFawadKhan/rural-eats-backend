import { Injectable } from '@nestjs/common';
import { db } from '../../db';
import { messagesTable } from '../../db/schema/messages.schema';
import { customersTable } from '../../db/schema/customers.schema';
import { eq, asc, desc } from 'drizzle-orm';

@Injectable()
export class ChatService {
  async saveMessage(data: { customerId: number, senderType: 'customer' | 'admin', senderId?: number, text: string }) {
    const [savedMessage] = await db.insert(messagesTable).values(data).returning();
    return savedMessage;
  }

  async getMessagesByCustomer(customerId: number) {
    return await db.select().from(messagesTable).where(eq(messagesTable.customerId, customerId)).orderBy(asc(messagesTable.createdAt));
  }

  async deleteChatByCustomer(customerId: number) {
    await db.delete(messagesTable).where(eq(messagesTable.customerId, customerId));
  }

  async getActiveCustomers() {
    const allMessages = await db.query.messagesTable.findMany({
      with: {
        customer: true,
      },
      orderBy: (messages, { desc }) => [desc(messages.createdAt)],
    });

    const customerMap = new Map();
    for (const msg of allMessages) {
      if (!customerMap.has(msg.customerId) && msg.customer) {
        customerMap.set(msg.customerId, {
          id: msg.customerId,
          name: msg.customer.name,
          avatar: msg.customer.name.charAt(0).toUpperCase(),
          lastMessage: msg.text,
          time: msg.createdAt,
          unread: 0,
          online: false
        });
      }
    }
    return Array.from(customerMap.values());
  }
}
