import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsNumber()
  @IsNotEmpty()
  categoryId!: number;

  @IsDateString()
  @IsNotEmpty()
  expenseDate!: string;

  @IsString()
  @IsOptional()
  attachmentUrl?: string;
}
