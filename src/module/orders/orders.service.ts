import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { db } from '../../db';
import { ordersTable } from '../../db/schema/orders.schema';
import { orderItemsTable } from '../../db/schema/order-items.schema';
import { CreateOrderDto, UpdateOrderDto } from './dto/create-order.dto';
import { CustomersService } from '../customers/customers.service';
import { eq, desc, gte, lte, and, sql, inArray } from 'drizzle-orm';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, startOfWeek, endOfWeek, format, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';

@Injectable()
export class OrdersService {
  constructor(private readonly customersService: CustomersService) {}

  async createOrder(createDto: CreateOrderDto) {
    if (!createDto.items || createDto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // 1. Resolve Customer (Create guest if necessary)
    let customerId: number;
    try {
      // In a real scenario, you might want to look up by phone number first
      const guest = await this.customersService.createGuest({
        name: createDto.customerInfo.name,
        phoneNumber: createDto.customerInfo.phoneNumber,
        email: createDto.customerInfo.email,
        address: createDto.customerInfo.address,
        city: createDto.customerInfo.city,
      });
      customerId = guest.id;
    } catch (error) {
      console.error('Error resolving customer:', error);
      throw new InternalServerErrorException('Failed to create customer for order');
    }

    // 2. Create Order
    let orderId: number;
    try {
      const result = await db.insert(ordersTable).values({
        customerId,
        totalAmount: createDto.totalAmount.toString(),
        status: 'pending',
        isTakeaway: createDto.isTakeaway || false,
      }).returning();
      orderId = result[0].id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new InternalServerErrorException('Failed to create order record');
    }

    // 3. Create Order Items
    try {
      const itemsToInsert = createDto.items.map(item => ({
        orderId,
        menuId: item.menuId || null,
        dealId: item.dealId || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
      }));

      await db.insert(orderItemsTable).values(itemsToInsert);
    } catch (error) {
      console.error('Error inserting order items:', error);
      throw new InternalServerErrorException('Failed to insert order items');
    }

    return this.getOrder(orderId);
  }

  async getRevenueStats(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Fetch all non-cancelled orders within range
    const orders = await db.query.ordersTable.findMany({
      where: and(
        gte(ordersTable.createdAt, start),
        lte(ordersTable.createdAt, end),
        inArray(ordersTable.status, ['confirmed', 'delivered', 'Confirmed', 'Delivered']),
      ),
      columns: { id: true, totalAmount: true, createdAt: true },
    });

    const totalInRange = orders.reduce((s, o) => s + parseFloat(o.totalAmount), 0);

    // Daily stats: today
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const todayOrders = await db.query.ordersTable.findMany({
      where: and(gte(ordersTable.createdAt, todayStart), lte(ordersTable.createdAt, todayEnd), inArray(ordersTable.status, ['confirmed', 'delivered', 'Confirmed', 'Delivered'])),
      columns: { totalAmount: true },
    });
    const dailyRevenue = todayOrders.reduce((s, o) => s + parseFloat(o.totalAmount), 0);

    // Monthly stats: this month
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    const monthOrders = await db.query.ordersTable.findMany({
      where: and(gte(ordersTable.createdAt, monthStart), lte(ordersTable.createdAt, monthEnd), inArray(ordersTable.status, ['confirmed', 'delivered', 'Confirmed', 'Delivered'])),
      columns: { totalAmount: true },
    });
    const monthlyRevenue = monthOrders.reduce((s, o) => s + parseFloat(o.totalAmount), 0);

    // Weekly stats: this week (Mon–Sun)
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    const weekOrders = await db.query.ordersTable.findMany({
      where: and(gte(ordersTable.createdAt, weekStart), lte(ordersTable.createdAt, weekEnd), inArray(ordersTable.status, ['confirmed', 'delivered', 'Confirmed', 'Delivered'])),
      columns: { totalAmount: true },
    });
    const weeklyRevenue = weekOrders.reduce((s, o) => s + parseFloat(o.totalAmount), 0);

    // Yearly stats: this year
    const yearStart = startOfYear(new Date());
    const yearEnd = endOfYear(new Date());
    const yearOrders = await db.query.ordersTable.findMany({
      where: and(gte(ordersTable.createdAt, yearStart), lte(ordersTable.createdAt, yearEnd), inArray(ordersTable.status, ['confirmed', 'delivered', 'Confirmed', 'Delivered'])),
      columns: { totalAmount: true },
    });
    const yearlyRevenue = yearOrders.reduce((s, o) => s + parseFloat(o.totalAmount), 0);

    // Build chart data grouped by day if range <= 31 days, else by month
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    let chartData: { label: string; revenue: number }[];

    if (diffDays <= 31) {
      // Group by day
      const days = eachDayOfInterval({ start, end });
      chartData = days.map(day => {
        const label = format(day, 'dd MMM');
        const dayRevenue = orders
          .filter(o => {
            const d = new Date(o.createdAt);
            return d >= startOfDay(day) && d <= endOfDay(day);
          })
          .reduce((s, o) => s + parseFloat(o.totalAmount), 0);
        return { label, revenue: parseFloat(dayRevenue.toFixed(2)) };
      });
    } else {
      // Group by month
      const months = eachMonthOfInterval({ start, end });
      chartData = months.map(month => {
        const mStart = startOfMonth(month);
        const mEnd = endOfMonth(month);
        const label = format(month, 'MMM yyyy');
        const mRevenue = orders
          .filter(o => {
            const d = new Date(o.createdAt);
            return d >= mStart && d <= mEnd;
          })
          .reduce((s, o) => s + parseFloat(o.totalAmount), 0);
        return { label, revenue: parseFloat(mRevenue.toFixed(2)) };
      });
    }

    // Report detail rows
    const reportOrders = await db.query.ordersTable.findMany({
      where: and(gte(ordersTable.createdAt, start), lte(ordersTable.createdAt, end), inArray(ordersTable.status, ['confirmed', 'delivered', 'Confirmed', 'Delivered'])),
      with: { customer: { columns: { name: true, phoneNumber: true } } },
      columns: { id: true, totalAmount: true, status: true, isTakeaway: true, createdAt: true },
      orderBy: [desc(ordersTable.createdAt)],
    });

    return {
      dailyRevenue: parseFloat(dailyRevenue.toFixed(2)),
      weeklyRevenue: parseFloat(weeklyRevenue.toFixed(2)),
      monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
      yearlyRevenue: parseFloat(yearlyRevenue.toFixed(2)),
      rangeRevenue: parseFloat(totalInRange.toFixed(2)),
      totalOrders: orders.length,
      chartData,
      reportRows: reportOrders.map(o => ({
        id: o.id,
        customer: o.customer?.name || 'Unknown',
        phone: o.customer?.phoneNumber || '',
        type: o.isTakeaway ? 'Takeaway' : 'Dine-in',
        amount: parseFloat(o.totalAmount),
        status: o.status,
        date: format(new Date(o.createdAt), 'dd MMM yyyy, hh:mm a'),
      })),
    };
  }

  async getAllOrders() {
    return db.query.ordersTable.findMany({
      with: {
        customer: true,
        orderItems: {
          with: {
            menu: true,
            deal: true,
          }
        }
      },
      orderBy: [desc(ordersTable.createdAt)],
    });
  }

  async getOrder(id: number) {
    return db.query.ordersTable.findFirst({
      where: eq(ordersTable.id, id),
      with: {
        customer: true,
        orderItems: {
          with: {
            menu: true,
            deal: true,
          }
        }
      }
    });
  }

  async updateOrder(id: number, updateDto: UpdateOrderDto) {
    const existing = await this.getOrder(id);
    if (!existing) {
      throw new BadRequestException('Order not found');
    }

    // Update status, totalAmount, isTakeaway
    const updateData: any = {};
    if (updateDto.status) updateData.status = updateDto.status;
    if (updateDto.totalAmount !== undefined) updateData.totalAmount = updateDto.totalAmount.toString();
    if (updateDto.isTakeaway !== undefined) updateData.isTakeaway = updateDto.isTakeaway;
    
    if (Object.keys(updateData).length > 0) {
      await db.update(ordersTable).set({ ...updateData, updatedAt: new Date() }).where(eq(ordersTable.id, id));
    }

    // If customer details were updated
    if (updateDto.customerInfo && existing.customerId) {
      await this.customersService.createGuest({
        name: updateDto.customerInfo.name,
        phoneNumber: updateDto.customerInfo.phoneNumber,
        email: updateDto.customerInfo.email,
        address: updateDto.customerInfo.address,
        city: updateDto.customerInfo.city,
      }); // this actually updates the existing user in CustomersService if phone matches!
    }

    // If items were completely replaced
    if (updateDto.items && updateDto.items.length > 0) {
      // delete old items
      await db.delete(orderItemsTable).where(eq(orderItemsTable.orderId, id));
      
      // insert new items
      const itemsToInsert = updateDto.items.map(item => ({
        orderId: id,
        menuId: item.menuId || null,
        dealId: item.dealId || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
      }));
      await db.insert(orderItemsTable).values(itemsToInsert);
    }

    return this.getOrder(id);
  }

  async deleteOrder(id: number) {
    // Delete items first due to foreign key
    await db.delete(orderItemsTable).where(eq(orderItemsTable.orderId, id));
    
    // Delete order
    await db.delete(ordersTable).where(eq(ordersTable.id, id));
    
    return { message: 'Order deleted successfully' };
  }
}
