import { IsString, IsOptional, IsUUID, IsBoolean, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateVersionDto {
  @ApiProperty()
  @IsObject()
  schema: any;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  uiSchema?: any;

  @ApiProperty()
  @IsObject()
  validationSchema: any;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  changeReason?: string;
}

export class CreateTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateTemplateVersionDto)
  version: CreateTemplateVersionDto;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}