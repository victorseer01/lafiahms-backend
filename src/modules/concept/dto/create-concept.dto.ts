import { IsString, IsOptional, IsBoolean, IsUUID, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConceptDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  datatype: string;

  @ApiProperty()
  @IsString()
  conceptClass: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isSet?: boolean;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  setMembers?: string[];
}