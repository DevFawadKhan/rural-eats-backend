import { Injectable } from '@nestjs/common';
import { db } from '../../db';
import { customersTable } from '../../db/schema/customers.schema';
import { ordersTable } from '../../db/schema/orders.schema';
import { expensesTable } from '../../db/schema/expenses.schema';
import { eq, desc, inArray, gte, lte, sql } from 'drizzle-orm';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

@Injectable()
export class DashboardService {
  async getOverview() {
    // 1. Fetch total customers
    const customers = await db.query.customersTable.findMany();
    const totalCustomers = customers.length;

    // 2. Fetch all orders and calculate counts
    const orders = await db.query.ordersTable.findMany({
      columns: { id: true, totalAmount: true, status: true, createdAt: true },
    });

    let totalOrders = orders.length;
    let confirmedOrders = 0;
    let pendingOrders = 0;
    let cancelledOrders = 0;
    let deliveredOrders = 0;
    let totalRevenue = 0;

    for (const order of orders) {
      const status = order.status.toLowerCase();
      if (status === 'confirmed') confirmedOrders++;
      else if (status === 'pending') pendingOrders++;
      else if (status === 'cancelled') cancelledOrders++;
      else if (status === 'delivered') deliveredOrders++;

      if (status === 'confirmed' || status === 'delivered') {
        totalRevenue += parseFloat(order.totalAmount);
      }
    }

    // 3. Fetch all expenses
    const expenses = await db.query.expensesTable.findMany({
      columns: { amount: true, createdAt: true },
    });
    
    let totalExpenses = 0;
    for (const exp of expenses) {
      totalExpenses += parseFloat(exp.amount);
    }

    // 4. Calculate Profit/Loss
    const profit = totalRevenue - totalExpenses;
    const totalProfit = profit > 0 ? profit : 0;
    const totalLoss = profit < 0 ? Math.abs(profit) : 0;

    // 5. Fetch recent 5 orders with customer info
    const recentOrdersRaw = await db.query.ordersTable.findMany({
      limit: 5,
      orderBy: [desc(ordersTable.createdAt)],
      with: { customer: { columns: { name: true } } },
      columns: { id: true, totalAmount: true, status: true, createdAt: true },
    });
    
    const recentOrders = recentOrdersRaw.map(o => ({
      id: `ORD-${o.id.toString().padStart(3, '0')}`,
      customer: o.customer?.name || 'Unknown',
      amount: `Rs.${parseFloat(o.totalAmount).toFixed(2)}`,
      status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
      time: o.createdAt.toISOString(),
    }));

    // 6. Fetch recent 5 customers
    const recentCustomersRaw = await db.query.customersTable.findMany({
      limit: 5,
      orderBy: [desc(customersTable.createdAt)],
      columns: { id: true, name: true, email: true, createdAt: true },
    });
    
    const recentCustomers = recentCustomersRaw.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email || 'No email',
      time: c.createdAt.toISOString(),
    }));

    // 7. Generate Chart Data: Revenue vs Expenses (Last 7 Days)
    const chartData: { name: string; revenue: number; expenses: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const start = startOfDay(date);
      const end = endOfDay(date);
      
      const dayRev = orders
        .filter(o => {
          const d = new Date(o.createdAt);
          const status = o.status.toLowerCase();
          return d >= start && d <= end && (status === 'confirmed' || status === 'delivered');
        })
        .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
        
      const dayExp = expenses
        .filter(e => {
          const d = new Date(e.createdAt);
          return d >= start && d <= end;
        })
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);
        
      chartData.push({
        name: format(date, 'EEE'), // Mon, Tue, etc.
        revenue: parseFloat(dayRev.toFixed(2)),
        expenses: parseFloat(dayExp.toFixed(2)),
      });
    }

    // 8. Generate Order Status Distribution Data
    const orderStatusData = [
      { name: 'Pending', value: pendingOrders },
      { name: 'Confirmed', value: confirmedOrders },
      { name: 'Delivered', value: deliveredOrders },
      { name: 'Cancelled', value: cancelledOrders },
    ].filter(item => item.value > 0);

    return {
      totalCustomers,
      totalOrders,
      confirmedOrders,
      pendingOrders,
      cancelledOrders,
      deliveredOrders,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      totalLoss: parseFloat(totalLoss.toFixed(2)),
      recentOrders,
      recentCustomers,
      revenueVsExpensesData: chartData,
      orderStatusData,
    };
  }
}
