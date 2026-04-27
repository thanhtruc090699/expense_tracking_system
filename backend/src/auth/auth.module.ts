import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtGuard } from './jwt/jwt.guard';

@Module({
  imports: [
    JwtModule.register({}),
  ],
  providers: [AuthService, JwtGuard],
  exports: [JwtModule, JwtGuard],
})
export class AuthModule {}
