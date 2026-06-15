import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  @IsOptional()
  restaurantName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;
}
