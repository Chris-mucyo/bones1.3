import { Request } from 'express';
import { Role } from '../../../generated/prisma/enums';

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
  shopname?: string;
  bio?: string;
  role: Role;
  phoneNumber?: string;
  isActive: boolean;
}

export interface JwtPayload {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface AuthenticatedRequest extends Request {
  user: UserProfile;
}

export interface LoginResponse {
  access_token: string;
  user: string;
}
