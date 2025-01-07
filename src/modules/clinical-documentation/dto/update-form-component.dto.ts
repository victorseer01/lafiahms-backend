import { PartialType } from '@nestjs/swagger';
import { CreateFormComponentDto } from './create-form-component.dto';

export class UpdateFormComponentDto extends PartialType(CreateFormComponentDto) {}