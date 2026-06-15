import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsArray()
  @IsOptional()
  permissions?: string[]; // Array of permission names to assign
}
