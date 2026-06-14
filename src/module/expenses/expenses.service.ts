import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../../db';
import { expensesTable } from '../../db/schema/expenses.schema';
import { eq, ilike, or, and, gte, lte, sql, SQL } from 'drizzle-orm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import * as ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { expenseCategoriesTable } from '../../db/schema/expense-categories.schema';

@Injectable()
export class ExpensesService {
  async create(createDto: CreateExpenseDto) {
    const amountStr = createDto.amount.toString();
    const result = await db.insert(expensesTable).values({
      ...createDto,
      amount: amountStr,
    }).returning();
    return result[0];
  }

  async findAll(query: { page?: number; limit?: number; search?: string; startDate?: string; endDate?: string }) {
    const { page = 0, limit = 20, search, startDate, endDate } = query;
    const offset = page * limit;

    const conditions: SQL[] = [];

    if (search) {
      const searchCondition = or(
        ilike(expensesTable.description, `%${search}%`),
        ilike(expensesTable.amount, `%${search}%`)
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    if (startDate) {
      conditions.push(gte(expensesTable.expenseDate, startDate));
    }

    if (endDate) {
      conditions.push(lte(expensesTable.expenseDate, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db.query.expensesTable.findMany({
      where: whereClause,
      with: {
        category: true,
      },
      orderBy: (expenses, { desc }) => [desc(expenses.expenseDate)],
      limit,
      offset,
    });

    const totalResult = await db.select({ count: sql<number>`count(*)` })
      .from(expensesTable)
      .where(whereClause);
      
    const total = Number(totalResult[0]?.count || 0);

    return { data, total };
  }

  async exportReport(query: { search?: string; startDate?: string; endDate?: string; type?: 'csv' | 'excel' }) {
    // Fetch all matching data without pagination
    const { data } = await this.findAll({ ...query, page: 0, limit: 1000000 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Expenses Report');

    const startStr = query.startDate ? format(new Date(query.startDate), 'MMM dd, yyyy') : 'Beginning';
    const endStr = query.endDate ? format(new Date(query.endDate), 'MMM dd, yyyy') : 'Today';
    
    // Top heading
    worksheet.addRow([`Expense Report from ${startStr} to ${endStr}`]);
    worksheet.addRow([]); 

    // Headers
    worksheet.addRow(['ID', 'Description', 'Category', 'Amount', 'Date']);

    let totalExpense = 0;
    data.forEach((exp) => {
      const amountNum = parseFloat(exp.amount as string) || 0;
      totalExpense += amountNum;
      
      worksheet.addRow([
        exp.id,
        exp.description,
        exp.category?.name || 'Uncategorized',
        amountNum,
        format(new Date(exp.expenseDate), 'MMM dd, yyyy')
      ]);
    });

    worksheet.addRow([]);
    worksheet.addRow(['', '', 'Total Expense:', totalExpense]);

    // Format columns width
    worksheet.getColumn(1).width = 10;
    worksheet.getColumn(2).width = 30;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 15;
    worksheet.getColumn(5).width = 20;

    const type = query.type || 'excel';
    if (type === 'csv') {
      const buffer = await workbook.csv.writeBuffer();
      return { buffer, contentType: 'text/csv', filename: `expenses-report-${Date.now()}.csv` };
    } else {
      const buffer = await workbook.xlsx.writeBuffer();
      return { buffer, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: `expenses-report-${Date.now()}.xlsx` };
    }
  }

  async findOne(id: number) {
    const expense = await db.query.expensesTable.findFirst({
      where: eq(expensesTable.id, id),
      with: {
        category: true,
      },
    });
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return expense;
  }

  async update(id: number, updateDto: UpdateExpenseDto) {
    const expense = await this.findOne(id);
    
    const updateData: any = { ...updateDto, updatedAt: new Date() };
    if (updateDto.amount !== undefined) {
      updateData.amount = updateDto.amount.toString();
    }

    const result = await db.update(expensesTable)
      .set(updateData)
      .where(eq(expensesTable.id, id))
      .returning();
      
    return result[0];
  }

  async remove(id: number) {
    await this.findOne(id);
    await db.delete(expensesTable).where(eq(expensesTable.id, id));
    return { message: 'Expense deleted successfully' };
  }
}
