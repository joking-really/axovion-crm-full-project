import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
  ) {}

  async create(data: Partial<Conversation>): Promise<Conversation> {
    const conversation = new this.conversationModel(data);
    return conversation.save();
  }

  async findAll(tenantId: string, query: any = {}): Promise<Conversation[]> {
    return this.conversationModel
      .find({ tenantId, ...query })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findById(id: string, tenantId: string): Promise<Conversation> {
    const conversation = await this.conversationModel
      .findOne({ _id: id, tenantId })
      .exec();
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  async addMessage(
    id: string,
    tenantId: string,
    message: any,
  ): Promise<Conversation> {
    const conversation = await this.conversationModel
      .findOneAndUpdate(
        { _id: id, tenantId },
        { $push: { messages: message } },
        { new: true },
      )
      .exec();
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<Conversation>,
  ): Promise<Conversation> {
    const conversation = await this.conversationModel
      .findOneAndUpdate({ _id: id, tenantId }, data, { new: true })
      .exec();
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  async getRecentForContact(
    contactId: string,
    tenantId: string,
    limit: number = 5,
  ): Promise<Conversation[]> {
    return this.conversationModel
      .find({ contactId, tenantId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}
