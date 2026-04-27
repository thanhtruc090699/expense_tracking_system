import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtGuard } from './jwt/jwt.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.KEYCLOAK_CLIENT_SECRET,
      verifyOptions: {
        issuer: process.env.KEYCLOAK_ISSUER,
        algorithms: ['RS256'],
      },
    }),
  ],
  providers: [AuthService, JwtGuard],
  exports: [JwtModule, JwtGuard],
})
export class AuthModule {}
