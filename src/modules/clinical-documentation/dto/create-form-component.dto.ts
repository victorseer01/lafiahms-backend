import { IsString, IsEnum, IsOptional, IsBoolean, IsObject, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FormComponentType, IValidationRule } from '@/common/interfaces/form-component.interface';

export class CreateFormComponentDto {
  @ApiProperty({ enum: FormComponentType })
  @IsEnum(FormComponentType)
  type: FormComponentType;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @ApiProperty({ required: false, type: [Object] })
  @IsArray()
  @IsOptional()
  validation?: IValidationRule[];

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  properties?: Record<string, any>;
}