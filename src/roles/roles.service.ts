import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../schemas/role.schema';
import { CreateRoleDto, UpdateRoleDto } from './role.dto';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async findAllPaginated(page: number, limit: number): Promise<{ items: Role[]; total: number }> {
    const [items, total] = await Promise.all([
      this.roleModel
        .find()
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.roleModel.countDocuments().exec(),
    ]);
    return { items, total };
  }
  
  async create(createRoleDto: CreateRoleDto): Promise<Role | null> {
    const existing = await this.roleModel.findOne({ name: createRoleDto.name });
    if (existing) {
      return null; 
    }

    const createdRole = new this.roleModel(createRoleDto);
    return createdRole.save();
  }

  async findAll(): Promise<Role[]> {
    return this.roleModel.find().exec();
  }

  async findOne(id: string): Promise<Role | null> {
    return this.roleModel.findById(id).exec();
  }
  
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role | null> {
    if (updateRoleDto.name) {
    
      const existing = await this.roleModel.findOne({
        name: updateRoleDto.name,
        _id: { $ne: id },
      });
      if (existing) {
        return null; 
      }
    }

    return this.roleModel.findByIdAndUpdate(id, updateRoleDto, { new: true }).exec();
  }
  
  async remove(id: string): Promise<any> {
    return this.roleModel.findByIdAndDelete(id).exec();
  }
}
