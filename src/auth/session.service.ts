import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class SessionService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async storeToken(userId: string, token: string, expiresIn: number = 3600): Promise<void> {
    // Store token with user ID as key, expires in 1 hour by default
    await this.cacheManager.set(`token:${userId}`, token, expiresIn);
  }

  async getToken(userId: string): Promise<string | null> {
    const token = await this.cacheManager.get<string>(`token:${userId}`);
    return token || null;
  }

  async removeToken(userId: string): Promise<void> {
    await this.cacheManager.del(`token:${userId}`);
  }

  async isTokenValid(userId: string, token: string): Promise<boolean> {
    const storedToken = await this.getToken(userId);
    return storedToken === token;
  }

  async refreshToken(userId: string, newToken: string, expiresIn: number = 3600): Promise<void> {
    await this.storeToken(userId, newToken, expiresIn);
  }
}
