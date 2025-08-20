import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAllPaginated(page: number, limit: number): Promise<User[]> {
    return this.userModel
      .find()
      .populate('roleId')
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }
  
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, password, roleId } = createUserDto;
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const createdUser = new this.userModel({ 
      name, 
      email, 
      password: hashedPassword, 
      roleId 
    });
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().populate('roleId').exec();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userModel.findById(id).populate('roleId').exec();
  }
  
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const updateData = { ...updateUserDto };
    
    // Hash password if it's being updated
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).populate('roleId').exec();
  }
  
  async remove(id: string): Promise<any> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
