import { Request } from 'express';
import { Role } from '../../../generated/prisma/enums';


export interface UserProfile {
    id: number;
    email: string;
    fullname: string;
    avatarUrl?: string;
    shopname?: string;
    bio?: string;
    role: Role;
    phoneNumber?: string;
    isActive: boolean;
}

export interface JwtPayload {
  id: number;
  username: string;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user: UserProfile;
}

export interface LoginResponse {
  access_token: string;
  user: string;
}
