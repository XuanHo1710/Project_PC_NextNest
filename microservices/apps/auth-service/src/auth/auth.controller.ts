import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.create')
  create(@Payload() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @MessagePattern('auth.findAll')
  findAll() {
    return this.authService.findAll();
  }

  @MessagePattern('auth.findOne')
  findOne(@Payload() id: number) {
    return this.authService.findOne(id);
  }

  @MessagePattern('auth.update')
  update(@Payload() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(updateAuthDto.id, updateAuthDto);
  }

  @MessagePattern('auth.remove')
  remove(@Payload() id: number) {
    return this.authService.remove(id);
  }
}
