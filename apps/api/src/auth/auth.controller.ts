import { Controller, Post, Body, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.authService.login(body.email, body.password, tenantId);
  }

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; name: string; tenantId: string; role?: string },
  ) {
    return this.authService.register(body);
  }
}
