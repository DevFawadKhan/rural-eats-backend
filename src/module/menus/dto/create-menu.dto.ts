import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  price!: number;

  @IsOptional()
  isAvailable?: string | boolean;
}
