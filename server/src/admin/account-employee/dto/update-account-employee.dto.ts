import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountEmployeeDto } from './create-account-employee.dto';

export class UpdateAccountEmployeeDto extends PartialType(CreateAccountEmployeeDto) {}
