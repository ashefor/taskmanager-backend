import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
    sub: string;  // user id
    email: string;
    version?: number; // optional for token invalidation
    exp?: number;
}

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) { }
    /**
     * Generate an access token for a user
     */
    generateAccessToken(payload: JwtPayload): string {
        return this.jwtService.sign(payload, {
            expiresIn: '1h', // adjust as needed
        });
    }

    /**
     * Generate a refresh token (longer lived)
     */
    generateRefreshToken(payload: JwtPayload): string {
        return this.jwtService.sign(payload, {
            expiresIn: '7d', // adjust as needed
        });
    }

    /**
     * Verify and decode a token
     */
    verifyToken(token: string): JwtPayload {
        return this.jwtService.verify<JwtPayload>(token);
    }
}
