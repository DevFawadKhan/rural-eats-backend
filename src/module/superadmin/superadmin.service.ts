import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../../db';
import { usersTable } from '../../db/schema/users.schema';
import { eq } from 'drizzle-orm';
import { UpdateSuperadminDto } from './dto/update-superadmin.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SuperadminService {
  async findAllUsers() {
    const allUsers = await db.select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    }).from(usersTable);

    return {
      message: 'Users retrieved successfully',
      data: allUsers,
    };
  }

  async update(id: number, updateDto: UpdateSuperadminDto) {
    // 1. Fetch user to verify existence and role
    const existingUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, id)
    });

    if (!existingUser) {
      throw new NotFoundException(`Superadmin with ID ${id} not found`);
    }

    if (existingUser.role !== 'superadmin') {
      throw new BadRequestException('User is not a superadmin');
    }

    // 2. Prepare payload
    const payload: Partial<typeof usersTable.$inferInsert> = {};
    if (updateDto.name) payload.name = updateDto.name;
    if (updateDto.email) payload.email = updateDto.email;
    
    if (updateDto.password) {
      const saltRounds = 10;
      payload.passwordHash = await bcrypt.hash(updateDto.password, saltRounds);
    }
    
    payload.updatedAt = new Date();

    if (Object.keys(payload).length === 1 && payload.updatedAt) {
      return { message: 'No valid fields provided to update' };
    }

    // 3. Execute update
    const updatedUser = await db.update(usersTable)
      .set(payload)
      .where(eq(usersTable.id, id))
      .returning({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        updatedAt: usersTable.updatedAt
      });

    return {
      message: 'Superadmin updated successfully',
      data: updatedUser[0]
    };
  }
}
