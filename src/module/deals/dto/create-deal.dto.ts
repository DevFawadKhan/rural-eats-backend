import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateDealDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  price!: string;

  @IsOptional()
  isActive?: string | boolean;

  @IsOptional()
  @IsString()
  dealItems?: string; // JSON string representing Array<{ menuId: number, size: string | null }>
}
