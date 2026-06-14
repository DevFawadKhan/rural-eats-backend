import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  categoryId!: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  isActive?: string | boolean;

  @IsOptional()
  hasSizes?: string | boolean;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  standardPrice?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  priceSmall?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  priceMedium?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  priceLarge?: number;
}
