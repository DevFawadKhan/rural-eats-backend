import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../../db';
import { customersTable } from '../../db/schema/customers.schema';
import { eq } from 'drizzle-orm';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CustomersService {
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
}
