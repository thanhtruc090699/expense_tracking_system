import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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

    if (process.env.DISABLE_AUTH === 'true') {
      const mockUser = await prisma.user.findFirst();
      request.user = mockUser
        ? {
            id: mockUser.id,
            email: mockUser.email,
            username: mockUser.username,
            keycloakId: mockUser.keycloakId,
            roles: [] as string[],
          }
        : {
            id: 'mock-user-id',
            email: 'mock@example.com',
            username: 'mock',
            keycloakId: 'mock-keycloak-id',
            roles: [] as string[],
          };
      return true;
    }

    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    try {
      const publicKey = await this.getPublicKey();
      const payload = await this.jwtService.verifyAsync(token, {
        publicKey: publicKey,
        issuer:
          process.env.KEYCLOAK_ISSUER ||
          'http://localhost:8080/realms/bill-buddy',
        algorithms: ['RS256'],
      });

      const keycloakId = payload.sub;
      const email = payload.email || `${keycloakId}@local`;

      let dbUser = await prisma.user.findUnique({
        where: { keycloakId },
        select: { id: true, email: true, username: true },
      });

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            keycloakId,
            email,
            username: payload.preferred_username || email.split('@')[0],
            currency: 'USD',
          },
          select: { id: true, email: true, username: true },
        });
      }

      request.user = {
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.username,
        keycloakId,
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
