import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto, RegisterDto } from './auth.dto';
import { Public } from './public.decorator';
import { AuthGuard } from './auth.guard';
import { PermissionsGuard } from './permissions.guard';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user and get token' })
  @ApiResponse({ status: 200, description: 'User successfully logged in.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth('JWT')
  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out.' })
  async logout(@Body('userId') userId: string) {
    return this.authService.logout(userId);
  }


  @ApiBearerAuth('JWT')
  @UseGuards(AuthGuard, PermissionsGuard) 
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile fetched successfully.' })
  async getProfile(@Req() request: Request) {
    const user = request['user'];  
    return {
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      isAdmin: user.isAdmin,
    };
  }

}
