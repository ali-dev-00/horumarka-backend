import { Injectable , Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { LoginDto, RegisterDto } from './auth.dto';
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

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;
  
    
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      return { status: false, message: 'Email already in use' };
    
    }
  
    const role = await this.roleModel.findOne({ name: 'user' }).exec();
    if (!role) {
      return { status: false, message: 'Role not found' };
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
      roleId: role._id, // Assign the roleId from the 'user' role
    });
  
    await newUser.save();
  
    const payload = {
      userId: newUser._id,
      roleId: role._id,
      permissions: role.permissions || [],  
    };
  
    const access_token = this.jwtService.sign(payload);
    
    await this.sessionService.storeToken(newUser._id.toString(), access_token);
  
    return {
      data: {
        access_token,
        user: {
          name: newUser.name,
          email: newUser.email,
          role: role.name,
          permissions: role.permissions || [],
          isAdmin: role.permissions && role.permissions.length > 0, 
        },
      },
    };
  }
  

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel
      .findOne({ email })
      .populate('roleId') 
      .exec();

    if (!user) {
      return { status: false, message: 'User not found' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { status: false, message: 'Invalid credentials' };
    }

    const role = user.roleId as unknown as Role & { _id: string };
    const permissions = role ? role.permissions : [];
    const payload = { userId: user._id, roleId: role._id, permissions };
    const access_token = this.jwtService.sign(payload);
    await this.sessionService.storeToken(user._id.toString(), access_token);

    return {
      status: true,
      data: {
        access_token,
        user: {
          name: user.name,
          email: user.email,
          role: role.name,
          permissions: permissions,
          isAdmin: permissions && permissions.length > 0 
        },
      },
    };
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.sessionService.removeToken(userId);
    return {
      message: 'Successfully logged out',
    };
  }

  async validateToken(userId: string, token: string): Promise<boolean> {
    return await this.sessionService.isTokenValid(userId, token);
  }
}
