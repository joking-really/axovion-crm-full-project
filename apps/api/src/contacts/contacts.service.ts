import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from './schemas/contact.schema';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
  ) {}

  async create(data: Partial<Contact>): Promise<Contact> {
    const contact = new this.contactModel(data);
    return contact.save();
  }

  async findAll(tenantId: string, query: any = {}): Promise<Contact[]> {
    return this.contactModel.find({ tenantId, ...query }).exec();
  }

  async findById(id: string, tenantId: string): Promise<Contact> {
    const contact = await this.contactModel.findOne({ _id: id, tenantId }).exec();
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async update(id: string, tenantId: string, data: Partial<Contact>): Promise<Contact> {
    const contact = await this.contactModel
      .findOneAndUpdate({ _id: id, tenantId }, data, { new: true })
      .exec();
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const result = await this.contactModel.findOneAndDelete({ _id: id, tenantId }).exec();
    if (!result) throw new NotFoundException('Contact not found');
  }

  async search(tenantId: string, searchTerm: string): Promise<Contact[]> {
    return this.contactModel.find({
      tenantId,
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
      ],
    }).exec();
  }
}
