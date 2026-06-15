import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { db } from '../../db';
import { usersTable } from '../../db/schema/users.schema';
import { customersTable } from '../../db/schema/customers.schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { CustomerSignupDto } from './dto/customer-signup.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Check internal users first (admins/superadmins)
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
      with: { 
        role: {
          with: {
            rolePermissions: {
              with: { permission: true }
            }
          }
        } 
      }
    });
    
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      
      if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

      const roleName = user.role?.name || 'Admin';
      const permissions = user.role?.rolePermissions?.map(rp => rp.permission.name) || [];
      const payload = { email: user.email, sub: user.id, role: roleName };
      return {
        message: 'Login successful',
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: roleName,
          roleId: user.roleId,
          permissions,
        }
      };
    }

    // If not found in internal users, check external customers
    const customer = await db.query.customersTable.findFirst({
      where: eq(customersTable.email, email)
    });
    
    if (customer) {
      if (!customer.passwordHash) {
        throw new UnauthorizedException('Account not fully registered. Please sign up first.');
      }
      const isPasswordValid = await bcrypt.compare(password, customer.passwordHash);
      
      if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

      const payload = { email: customer.email, sub: customer.id, role: 'customer' };
      return {
        message: 'Login successful',
        access_token: this.jwtService.sign(payload),
        user: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          role: 'customer',
        }
      };
    }

    // Not found in either table
    throw new UnauthorizedException('Invalid credentials');
  }

  async customerSignup(dto: CustomerSignupDto) {
    const { name, email, password, phoneNumber, address, city } = dto;

    const existing = await db.query.customersTable.findFirst({
      where: eq(customersTable.email, email)
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newCustomer = await db.insert(customersTable).values({
      name,
      email,
      passwordHash,
      phoneNumber,
      address,
      city,
    }).returning();

    const customer = newCustomer[0];
    const payload = { email: customer.email, sub: customer.id, role: 'customer' };
    
    return {
      message: 'Customer registered successfully',
      access_token: this.jwtService.sign(payload),
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        role: 'customer',
      }
    };
  }

}
