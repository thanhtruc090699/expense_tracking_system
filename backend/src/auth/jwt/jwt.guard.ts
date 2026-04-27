import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '../../prisma';

@Injectable()
export class JwtGuard implements CanActivate {
  private jwksUrl: string;

  constructor(private jwtService: JwtService) {
    this.jwksUrl = `${process.env.KEYCLOAK_ISSUER || 'http://localhost:8080/realms/bill-buddy'}/protocol/openid-connect/certs`;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    try {
      const publicKey = await this.getPublicKey();
      const payload = await this.jwtService.verifyAsync(token, {
        publicKey: publicKey,
        issuer: process.env.KEYCLOAK_ISSUER || 'http://localhost:8080/realms/bill-buddy',
        algorithms: ['RS256'],
      });

      const dbUser = await prisma.user.findUnique({
        where: { keycloakId: payload.sub },
        select: { id: true, email: true, username: true },
      });

      if (!dbUser) {
        throw new UnauthorizedException('User not found in database');
      }

      request.user = {
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.username,
        keycloakId: payload.sub,
        roles: payload.resource_access?.['bill-buddy']?.roles || [],
      };

      return true;
    } catch (error) {
      console.error('Guard error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractToken(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return undefined;
    }
    return authHeader.split(' ')[1];
  }

  private async getPublicKey(): Promise<string> {
    const response = await fetch(this.jwksUrl);
    if (!response.ok) {
      throw new UnauthorizedException('Failed to fetch JWKS');
    }

    const jwks = await response.json();
    const key = jwks.keys[0];

    if (!key?.x5c?.[0]) {
      throw new UnauthorizedException('No public key found in JWKS');
    }

    return `-----BEGIN CERTIFICATE-----\n${key.x5c[0]}\n-----END CERTIFICATE-----`;
  }
}
