import { IsUUID, IsDate, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateObservationDto } from './create-observation.dto';

export class CreateEncounterDto {
  @ApiProperty()
  @IsUUID()
  patientId: string;

  @ApiProperty()
  @IsUUID()
  encounterType: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  encounterDatetime: Date;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  locationId?: string;

  @ApiProperty({ type: [CreateObservationDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateObservationDto)
  @IsOptional()
  observations?: CreateObservationDto[];
}
