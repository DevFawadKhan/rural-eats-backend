import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../../db';
import { customersTable } from '../../db/schema/customers.schema';
import { eq, or } from 'drizzle-orm';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CustomersService {
  async getAll() {
    return await db.query.customersTable.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        address: true,
        city: true,
        isGuest: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: (customers, { desc }) => [desc(customers.createdAt)],
    });
  }

  async getProfile(id: number) {
    const customer = await db.query.customersTable.findFirst({
      where: eq(customersTable.id, id),
      columns: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        address: true,
        city: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async updateProfile(id: number, dto: UpdateCustomerDto) {
    const updateData: any = { ...dto, updatedAt: new Date() };

    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
      delete updateData.password;
    }

    const updated = await db.update(customersTable)
      .set(updateData)
      .where(eq(customersTable.id, id))
      .returning({
        id: customersTable.id,
        name: customersTable.name,
        email: customersTable.email,
        phoneNumber: customersTable.phoneNumber,
        address: customersTable.address,
        city: customersTable.city,
        updatedAt: customersTable.updatedAt,
      });

    if (updated.length === 0) {
      throw new NotFoundException('Customer not found');
    }
    return updated[0];
  }

  async createGuest(data: { name: string; phoneNumber: string; address?: string; city?: string; email?: string }) {
    // Generate a unique dummy email if not provided
    const emailToUse = data.email || `${data.phoneNumber.replace(/[^0-9]/g, '')}@guest.ruraleats.com`;

    // Check if customer exists by email or phone
    const existingCustomer = await db.query.customersTable.findFirst({
      where: or(
        eq(customersTable.email, emailToUse),
        eq(customersTable.phoneNumber, data.phoneNumber)
      ),
    });

    if (existingCustomer) {
      // Return existing customer to attach to order
      return existingCustomer;
    }

    const newCustomer = await db.insert(customersTable).values({
      name: data.name,
      phoneNumber: data.phoneNumber,
      email: emailToUse,
      address: data.address,
      city: data.city,
      isGuest: true,
      // passwordHash remains null since it's optional now
    }).returning({
      id: customersTable.id,
      name: customersTable.name,
      email: customersTable.email,
      phoneNumber: customersTable.phoneNumber,
      isGuest: customersTable.isGuest,
    });

    return newCustomer[0];
  }
}
