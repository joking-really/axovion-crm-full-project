export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'tenant_admin' | 'agent' | 'viewer';
  tenantId: string;
  isActive: boolean;
}

export interface Tenant {
  id: string;
  subdomain: string;
  name: string;
  plan: 'starter' | 'professional' | 'enterprise' | 'custom';
  isActive: boolean;
}

export interface Contact {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  phone?: string;
  status: 'lead' | 'prospect' | 'customer' | 'churned';
  tags: string[];
  assignedTo?: string;
}

export interface Message {
  content: string;
  sender: 'user' | 'ai' | 'agent';
  agentId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  tenantId: string;
  contactId: string;
  channel: 'whatsapp' | 'email' | 'voice' | 'sms' | 'web';
  status: 'active' | 'pending' | 'resolved' | 'escalated';
  messages: Message[];
  assignedTo?: string;
}

export interface Subscription {
  id: string;
  tenantId: string;
  plan: string;
  usageCredits: number;
  usedCredits: number;
  isActive: boolean;
}

export interface DashboardStats {
  totalConversations: number;
  totalContacts: number;
  aiInteractions: number;
  avgResponseTime: number;
  period: string;
}
