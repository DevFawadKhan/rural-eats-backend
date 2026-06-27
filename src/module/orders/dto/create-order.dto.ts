import { IsString, IsNumber, IsOptional, ValidateNested, IsArray, IsBoolean, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderCustomerInfoDto {
  @IsString()
  name: string;

  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  whatsappNumber?: string;
}

export class OrderItemInputDto {
  @IsOptional()
  @IsNumber()
  menuId?: number;

  @IsOptional()
  @IsNumber()
  dealId?: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsOptional()
  @IsString()
  size?: string;
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => OrderCustomerInfoDto)
  customerInfo: OrderCustomerInfoDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];

  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsBoolean()
  isTakeaway?: boolean;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsString()
  landmark?: string;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'Confirmed', 'Delivered', 'Cancelled'])
  status?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderCustomerInfoDto)
  customerInfo?: OrderCustomerInfoDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items?: OrderItemInputDto[];

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsBoolean()
  isTakeaway?: boolean;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsString()
  landmark?: string;
}
