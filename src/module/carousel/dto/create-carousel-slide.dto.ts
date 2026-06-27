import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateCarouselSlideDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  imageUrl: string;

  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
