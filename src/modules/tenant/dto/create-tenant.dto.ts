import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  domain: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  implementationId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subscriptionPlan: string;
}
