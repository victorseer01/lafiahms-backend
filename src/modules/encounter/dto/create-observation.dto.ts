import { IsUUID, IsDate, IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateObservationDto {
  @ApiProperty()
  @IsUUID()
  conceptId: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  observationDatetime: Date;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  valueText?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  valueNumeric?: number;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  valueCoded?: string;

  @ApiProperty({ required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  valueDatetime?: Date;
}