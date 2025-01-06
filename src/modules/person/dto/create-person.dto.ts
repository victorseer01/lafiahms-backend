import { IsString, IsOptional, IsBoolean, IsDate, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePersonDto {
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
  @IsBoolean()
  @IsOptional()
  birthdateEstimated?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  dead?: boolean;

  @ApiProperty({ required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  deathDate?: Date;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  causeOfDeath?: string;
}
