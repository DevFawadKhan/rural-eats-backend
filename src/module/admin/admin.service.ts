import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../../db';
import { usersTable } from '../../db/schema/users.schema';
import { eq } from 'drizzle-orm';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  async findAllUsers() {
    const allUsers = await db.query.usersTable.findMany({
      with: {
        role: {
          with: {
            rolePermissions: {
              with: {
                permission: true
              }
            }
          }
        }
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });

    return {
      message: 'Users retrieved successfully',
      data: allUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        assignedRoleName: user.role ? user.role.name : null,
        permissions: user.role ? user.role.rolePermissions.map(rp => rp.permission.name) : [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    };
  }

  async createUser(dto: CreateUserDto) {
    const existingUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, dto.email)
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const newUser = await db.insert(usersTable).values({
      name: dto.name,
      email: dto.email,
      passwordHash,
      roleId: dto.roleId || null,
    }).returning();

    return {
      message: 'User created successfully',
      data: newUser[0],
    };
  }

  async update(id: number, updateDto: UpdateAdminDto) {
    // 1. Fetch user to verify existence and role
    const existingUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, id),
      with: { role: true }
    });

    if (!existingUser) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    if (existingUser.role?.name !== 'Admin') {
      throw new BadRequestException('User is not an Admin');
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
        updatedAt: usersTable.updatedAt
      });

    return {
      message: 'Admin updated successfully',
      data: updatedUser[0]
    };
  }
}
