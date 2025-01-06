import { IsString, IsOptional, IsUUID, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitFormDto {
  @ApiProperty()
  @IsUUID()
  templateId: string;

  @ApiProperty()
  @IsUUID()
  patientId: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  encounterId?: string;

  @ApiProperty()
  @IsObject()
  formData: any;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  status?: string = 'draft';
}