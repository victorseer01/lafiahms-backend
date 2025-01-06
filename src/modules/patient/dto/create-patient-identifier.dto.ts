import { IsString, IsUUID, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientIdentifierDto {
  @ApiProperty()
  @IsString()
  identifier: string;

  @ApiProperty()
  @IsUUID()
  identifierTypeId: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  preferred?: boolean;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  locationId?: string;
}
