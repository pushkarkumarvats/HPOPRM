import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: any) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await argon2.hash(data.password);
    const user = await this.prisma.user.create({
      data: { ...data, passwordHash, password: undefined },
    });

    const tokens = await this.generateTokens(user.id);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  private async generateTokens(userId: string) {
    const accessToken = this.jwtService.sign({ sub: userId });
    const refreshToken = this.jwtService.sign({ sub: userId }, { expiresIn: '30d' });
    
    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
