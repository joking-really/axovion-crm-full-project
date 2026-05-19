import { Controller, Post, Body, Headers } from '@nestjs/common';

@Controller('webhooks')
export class WebhooksController {
  @Post('stripe')
  async handleStripeWebhook(
    @Body() body: any,
    @Headers('stripe-signature') signature: string,
  ) {
    // TODO: Verify webhook signature and handle events
    console.log('Stripe webhook received:', body.type);
    return { received: true };
  }

  @Post('twilio')
  async handleTwilioWebhook(@Body() body: any) {
    // TODO: Handle incoming SMS/voice webhooks
    console.log('Twilio webhook received:', body);
    return { received: true };
  }

  @Post('whatsapp')
  async handleWhatsAppWebhook(@Body() body: any) {
    // TODO: Handle WhatsApp Business API webhooks
    console.log('WhatsApp webhook received:', body);
    return { received: true };
  }
}
