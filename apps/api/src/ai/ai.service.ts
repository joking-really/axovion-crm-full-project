import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { ConversationsService } from '../conversations/conversations.service';

@Injectable()
export class AiService {
  private groq: Groq;

  constructor(
    private configService: ConfigService,
    private conversationsService: ConversationsService,
  ) {
    this.groq = new Groq({
      apiKey: this.configService.get('GROQ_API_KEY'),
    });
  }

  async generateResponse(
    conversationId: string,
    tenantId: string,
    message: string,
  ): Promise<string> {
    const conversation = await this.conversationsService.findById(
      conversationId,
      tenantId,
    );

    const recentMessages = conversation.messages.slice(-5);
    const context = recentMessages
      .map((m) => `${m.sender}: ${m.content}`)
      .join('\n');

    const systemPrompt = `You are an AI assistant for Axovion CRM. Be helpful, professional, and concise. Respond in the same language as the user. Previous context:\n${context}`;

    const completion = await this.groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      model: 'llama3-70b-8192',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, I could not process that.';

    await this.conversationsService.addMessage(conversationId, tenantId, {
      content: message,
      sender: 'user',
      timestamp: new Date(),
    });

    await this.conversationsService.addMessage(conversationId, tenantId, {
      content: response,
      sender: 'ai',
      timestamp: new Date(),
    });

    return response;
  }

  async analyzeSentiment(text: string): Promise<string> {
    const completion = await this.groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Analyze the sentiment of the following text. Respond with only one word: positive, negative, or neutral.',
        },
        { role: 'user', content: text },
      ],
      model: 'llama3-8b-8192',
      temperature: 0.1,
      max_tokens: 10,
    });

    return completion.choices[0]?.message?.content?.toLowerCase() || 'neutral';
  }
}
