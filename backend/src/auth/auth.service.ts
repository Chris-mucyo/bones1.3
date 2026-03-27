import { Injectable, NotAcceptableException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtPayload, LoginResponse, UserProfile } from './types/auth.types';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable() 
export class AuthService {
    constructor(
        private userServise: UsersService,
        private jwtServices: JwtService,
    ){}

    async validateUser(
        identifier: string,
        password: string,
    ): Promise<UserProfile | null> {
        const user = await this.userServise.findByEmail(identifier);
    }

}