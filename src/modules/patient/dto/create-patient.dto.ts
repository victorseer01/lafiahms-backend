import { IsUUID, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreatePersonDto } from '../../person/dto/create-person.dto';
import { CreatePatientIdentifierDto } from './create-patient-identifier.dto';

export class CreatePatientDto {
  @ApiProperty({ required: false })
  @ValidateNested()
  @Type(() => CreatePersonDto)
  @IsOptional()
  person?: CreatePersonDto;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  personId?: string;

  @ApiProperty({ type: [CreatePatientIdentifierDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePatientIdentifierDto)
  identifiers: CreatePatientIdentifierDto[];
}
