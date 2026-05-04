import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service.js';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: (() => {
        const id = config.get<string>('GOOGLE_CLIENT_ID');
        if (!id) throw new Error('GOOGLE_CLIENT_ID missing');
        return id;
      })(),
      clientSecret: (() => {
        const secret = config.get<string>('GOOGLE_CLIENT_SECRET');
        if (!secret) throw new Error('GOOGLE_CLIENT_SECRET missing');
        return secret;
      })(),
      callbackURL: (() => {
        const url = config.get<string>('GOOGLE_CALLBACK_URL');
        if (!url) throw new Error('GOOGLE_CALLBACK_URL missing');
        return url;
      })(),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { id, emails, displayName, photos } = profile;

    const user = await this.usersService.findOrCreateGoogleUser({
      providerId: id,
      email: emails[0].value,
      fullName: displayName,
      avatarUrl: photos?.[0]?.value,
    });

    done(null, user);
  }
}
