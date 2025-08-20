import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './auth.dto';
import { CreateUserDto } from '../users/user.dto';
import { Role } from '../schemas/role.schema';
import { SessionService } from './session.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
  ) {}

  // Register user
  async register(createUserDto: CreateUserDto) {
    const { name, email, password, roleId } = createUserDto;

    // Default role to 'user' if no roleId is provided
    const role = await this.roleModel.findById(roleId || 'default_role_id').exec();  // Replace with actual 'user' role ID

    if (!role) {
      throw new Error('Role not found');
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const newUser = new this.userModel({ name, email, password: hashedPassword, roleId: role._id });
    await newUser.save();

    const payload = { userId: newUser._id, roleId: newUser.roleId, permissions: role.permissions };

    const access_token = this.jwtService.sign(payload); // Generate JWT
    
    // Store token on server side
    await this.sessionService.storeToken(newUser._id.toString(), access_token);

    return {
      data: {
        access_token,
        user: {
          name: newUser.name,
          email: newUser.email,
          role: role.name,
          permissions: role.permissions,
        },
      },
    };
  }

  // Login user
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userModel
      .findOne({ email })
      .populate('roleId') // Populate the full role document
      .exec();

    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const role = user.roleId as unknown as Role & { _id: string }; // TypeScript: role is now populated, cast to Role
    const permissions = role ? role.permissions : []; // Access permissions from populated role

    const payload = { userId: user._id, roleId: role._id, permissions };

    const access_token = this.jwtService.sign(payload); // Generate JWT
    
    // Store token on server side
    await this.sessionService.storeToken(user._id.toString(), access_token);

    return {
      data: {
        access_token,
        user: {
          name: user.name,
          email: user.email,
          role: role.name,
          permissions: permissions,
        },
      },
    };
  }

  // Logout user
  async logout(userId: string): Promise<{ message: string }> {
    // Remove token from server-side storage
    await this.sessionService.removeToken(userId);
    
    return {
      message: 'Successfully logged out',
    };
  }

  // Validate token from server-side storage
  async validateToken(userId: string, token: string): Promise<boolean> {
    return await this.sessionService.isTokenValid(userId, token);
  }
}
