import { Injectable, NotAcceptableException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtPayload, LoginResponse, UserProfile } from './types/auth.types';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private userServise: UsersService,
        private jwtServices: JwtService,
    ) { }

    async validateUser(
        identifier: string,
        password: string,
    ): Promise<UserProfile> {

        const user = await this.userServise.findByEmail(identifier);

        if (!user || !user.passwordHash) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            throw new NotAcceptableException('Account is deactivated');
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }

    login(user: UserProfile): LoginResponse {
        const payload: JwtPayload = {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        };

        const accessToken = this.jwtServices.sign(payload);

        return {
            access_token: accessToken,
            user: user.fullName,
        }
    }

    validateToken(token: string): UserProfile {
        try {
            return this.jwtServices.verify<JwtPayload>(token);
        } catch {
            throw new UnauthorizedException('Invalid token');
        }
    }

    async refreshToken(oldToken: string): Promise<LoginResponse> {
        const decode = this.jwtServices.decode(oldToken) as JwtPayload;
        const user = await this.userServise.findByEmail(decode.email);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (!user.isActive) {
            throw new NotAcceptableException('Account is deactivated');
        }

        if (!oldToken || !decode) {
            throw new UnauthorizedException('Invalid token');
        }

        const { passwordHash, refreshToken, ...userWithoutSensitive } = user;
        return this.login(userWithoutSensitive);

    }

}

