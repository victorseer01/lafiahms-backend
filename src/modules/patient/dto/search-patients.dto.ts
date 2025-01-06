import { IsString, IsOptional, IsDate, IsUUID, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

export class SearchPatientsDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  identifier?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({ required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  birthdate?: Date;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  identifierType?: string;

  @ApiProperty({ required: false, enum: ['firstName', 'lastName', 'birthdate', 'created'] })
  @IsEnum(['firstName', 'lastName', 'birthdate', 'created'])
  @IsOptional()
  sortBy?: string;

  @ApiProperty({ required: false, enum: SortOrder })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;
}