import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/admin/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
export class AdminBaseController { }