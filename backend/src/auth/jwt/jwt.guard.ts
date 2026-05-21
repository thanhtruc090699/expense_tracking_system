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
	// JSON Web Key Set (RFC 7517) URL
	private jwksurl: string;

	constructor(private jwtService: JwtService) {
		this.jwksurl = `${process.env.KEYCLOAK_ISSUER
			|| 'http://localhost:8080/realms/bill-buddy'}/protocol/openid-connect/certs`;
	}
	
	async canActivate(context: ExecutionContext): Promise<boolean> {
		// Extract HTTP request from the NestJS exec context.
		const request = context.switchToHttp().getRequest();

		/* ---------------- Mock Auth Flow ---------------- */

		// Check wheter auth is disabled. See .env.example
		if (process.env.DISABLE_AUTH === 'true') {
			// Fetch the first user from the db.
			const mockUser = await prisma.user.findFirst();

			if (mockUser) {
				// User exists in the DB
				request.user = {
					id: mockUser.id,
					email: mockUser.email,
					username: mockUser.username,
					keycloakId: mockUser.keycloakId,
					roles: [] as string[],
				}
			} else {
				// No user, create one
				request.user = {
					id: 'mock-user-id',
					email: 'mock@example.com',
					username: 'mock',
					keycloakId: 'mock-keycloak-id',
					roles: [] as string[],
				}
			}

			return true; // Let the user in.
		}

		/* ---------------- Real Auth Flow ---------------- */

		const token = this.extractToken(request);

		if (!token) {
			// Bad token, return 401.
			throw new UnauthorizedException(
				"Missing or invalid authorization header"
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

			//TODO: Maybe use user service here instead of rawdoging prisma?
			let dbUser = await prisma.user.findUnique({
				where: { keycloakId },
				select: { id: true, email: true, username: true },
			});

			// Create local user if they don't exist.
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

			// Set user in the request.
			request.user = {
				id: dbUser.id,
				email: dbUser.email,
				username: dbUser.username,
				keycloakId,
				roles: payload.resource_access?.['bill-buddy-api'] || [],
			};

			return true; // Let the user in.

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
		const response = await fetch(this.jwksurl);

		if (!response.ok) {
			throw new UnauthorizedException("Failed to fetch JWKS");
		}

		const jwks = await response.json(); // Parse JSON.
		const key = jwks.keys[0]; // Grab the first key.

		if (!key?.x5c?.[0]) {
			throw new UnauthorizedException("No public key found in JWKS");
		}

		// Format as PEM-encoded string.
		return `-----BEGIN CERTIFICATE-----\n${key.x5c[0]}\n-----END CERTIFICATE-----`;
	}
}

