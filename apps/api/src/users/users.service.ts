import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(data: Partial<User>): Promise<User> {
    const user = new this.userModel(data);
    return user.save();
  }

  async findAll(tenantId: string): Promise<User[]> {
    return this.userModel.find({ tenantId }).select('-password').exec();
  }

  async findById(id: string, tenantId: string): Promise<User> {
    const user = await this.userModel
      .findOne({ _id: id, tenantId })
      .select('-password')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string, tenantId: string): Promise<UserDocument> {
    return this.userModel.findOne({ email, tenantId }).exec();
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<User>,
  ): Promise<User> {
    const user = await this.userModel
      .findOneAndUpdate({ _id: id, tenantId }, data, { new: true })
      .select('-password')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const result = await this.userModel
      .findOneAndDelete({ _id: id, tenantId })
      .exec();
    if (!result) throw new NotFoundException('User not found');
  }
}
