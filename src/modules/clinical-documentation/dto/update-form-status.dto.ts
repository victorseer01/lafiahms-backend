import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum FormStatus {
  DRAFT = 'draft',
  COMPLETED = 'completed',
  SIGNED = 'signed',
  ARCHIVED = 'archived'
}

export class UpdateFormStatusDto {
  @ApiProperty({ enum: FormStatus })
  @IsEnum(FormStatus)
  status: FormStatus;
}