import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from './schemas/tenant.schema';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
  ) {}

  async create(data: Partial<Tenant>): Promise<Tenant> {
    const tenant = new this.tenantModel({
      ...data,
      databaseName: `axovion_tenant_${data.subdomain}`,
    });
    return tenant.save();
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantModel.find().exec();
  }

  async findById(id: string): Promise<Tenant> {
    const tenant = await this.tenantModel.findById(id).exec();
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async findBySubdomain(subdomain: string): Promise<Tenant> {
    const tenant = await this.tenantModel.findOne({ subdomain }).exec();
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async update(id: string, data: Partial<Tenant>): Promise<Tenant> {
    const tenant = await this.tenantModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async delete(id: string): Promise<void> {
    const result = await this.tenantModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Tenant not found');
  }
}
