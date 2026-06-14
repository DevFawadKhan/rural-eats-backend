import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseIntPipe, Query, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import type { Response } from 'express';

const storage = diskStorage({
  destination: './uploads/images/expenses',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  }
});

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('attachment', { storage }))
  create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    const createDto: CreateExpenseDto = {
      description: body.description,
      amount: Number(body.amount),
      categoryId: Number(body.categoryId),
      expenseDate: body.expenseDate,
      attachmentUrl: file ? `/uploads/images/expenses/${file.filename}` : undefined,
    };
    return this.expensesService.create(createDto);
  }

  @Get('export')
  async exportReport(
    @Query('search') search: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('type') type: 'csv' | 'excel',
    @Res() res: Response
  ) {
    const { buffer, contentType, filename } = await this.expensesService.exportReport({ search, startDate, endDate, type });
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.expensesService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('attachment', { storage }))
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any, @UploadedFile() file: Express.Multer.File) {
    const updateDto: UpdateExpenseDto = {};
    if (body.description !== undefined) updateDto.description = body.description;
    if (body.amount !== undefined) updateDto.amount = Number(body.amount);
    if (body.categoryId !== undefined) updateDto.categoryId = Number(body.categoryId);
    if (body.expenseDate !== undefined) updateDto.expenseDate = body.expenseDate;
    
    if (file) {
      updateDto.attachmentUrl = `/uploads/images/expenses/${file.filename}`;
    }

    return this.expensesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.expensesService.remove(id);
  }
}
