import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tenantsService: TenantsService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string, tenantId: string) {
    const user = await this.usersService.findByEmail(email, tenantId);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(email: string, password: string, tenantId: string) {
    const user = await this.validateUser(email, password, tenantId);
    const payload = {
      sub: user._id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    tenantId: string;
    role?: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await this.usersService.create({
      ...data,
      password: hashedPassword,
    });

    return this.login(data.email, data.password, data.tenantId);
  }
}
