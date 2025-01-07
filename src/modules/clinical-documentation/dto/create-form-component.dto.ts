import { IsString, IsEnum, IsOptional, IsBoolean, IsObject, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FormComponentType } from '../enums/form-component.enum';

export class CreateFormComponentDto {
  @ApiProperty({ enum: FormComponentType })
  @IsEnum(FormComponentType)
  type: FormComponentType;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  properties?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  validationRules?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  options?: any[];
}