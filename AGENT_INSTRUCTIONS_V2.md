# AXOVION CRM — COMPLETE BUILD INSTRUCTIONS FOR AGENT SWARM (v2)

## CRITICAL CONTEXT

This document replaces any previous instructions. The agent swarm MUST read this entire file before writing any code. This project is the result of a 100-question architecture session covering every detail of a production multi-tenant AI SaaS CRM.

**Repository:** `https://github.com/joking-really/axovion-crm-full-project`
**Company:** Axovion (axovion.io)
**Target Market:** Pakistan-first, global expansion
**Status:** Scaffolded but INCOMPLETE — every module needs full implementation

---

## ARCHITECTURE DECISIONS (NON-NEGOTIABLE)

These were debated extensively and are LOCKED:

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui | App Router, copy-paste components, no npm dep |
| Backend | NestJS 10 + FastAPI hybrid | NestJS for CRM, FastAPI for AI inference |
| Database | MongoDB Atlas M10 | Database-per-tenant isolation |
| Cache/Queue | Redis + BullMQ | Socket.IO adapter, job queues |
| Real-time | Socket.IO with Redis Adapter | Multi-instance support |
| AI LLM | Groq Llama 3.3 70B primary, OpenAI GPT-4o-mini fallback, Together AI tertiary | <100ms, $0.0009/1K tokens |
| AI Voice | Twilio + ElevenLabs Multilingual v2 + OpenAI Whisper-1 | TTS $0.10/1K chars, STT $0.006/min |
| Telephony | Twilio (warm transfer via `<Dial>`) | Vonage/Nexmo fallback deferred post-MVP |
| WhatsApp | Twilio WhatsApp API (platform WABA Starter/Growth, tenant WABA Pro) | Hybrid model for template approval |
| Email | Resend | Transactional + marketing |
| File Storage | Cloudflare R2 | S3-compatible, cheaper |
| Billing | Stripe | Subscriptions + usage credits |
| Deployment | Docker + Docker Compose on AWS EC2 t3.large ap-southeast-1 | Closest to Pakistan |
| CDN | Cloudflare | SSL + caching |
| CI/CD | GitHub Actions | Test → build → deploy |
| Monitoring | UptimeRobot + Sentry + Grafana Cloud | 3-layer monitoring |
| Forms | React Hook Form + Zod | Type-safe validation |
| State | Zustand (client) + TanStack Query (server) | Industry standard |

---

## PRICING TIERS (LOCKED)

| Plan | Price | Concurrent AI Calls | Included Minutes | Channels | White-Label |
|------|-------|---------------------|------------------|----------|-------------|
| Starter | $49/user/month | 10 | 300 | WhatsApp, Email | No |
| Growth | $79/user/month | 20 | 500 | Voice, WhatsApp, Email | No |
| Pro | $149/user/month | 50 | 1,000 | All + API | Logo + Color |
| Enterprise | $349+/user/month | 100+ | Unlimited | All + Custom | Full |

- **Hybrid billing:** Subscription base + usage credits
- **Credit top-ups:** $20 for 500 additional minutes
- **Credit expiry:** 12 months rolling, FIFO consumption
- **Overage:** $0.04/minute above plan
- **Annual discount:** 2 months free
- **Trial:** 14-day free trial

---

## MULTI-TENANCY (DATABASE-PER-TENANT)

### Structure
```
Cluster: axovion-crm-prod
├── tenant_abc123 (database)
│   ├── contacts, conversations, messages, calls, deals, users, settings
├── tenant_def456 (database)
└── axovion_admin (database)
    ├── tenants, subscriptions, invoices, system_logs
```

### Connection Service
```typescript
@Injectable()
export class TenantConnectionService {
  private connections: Map<string, Connection> = new Map();

  async getConnection(tenantId: string): Promise<Connection> {
    if (this.connections.has(tenantId)) return this.connections.get(tenantId);
    const uri = `${process.env.MONGODB_URI}/${tenantId}`;
    const connection = await mongoose.createConnection(uri);
    this.connections.set(tenantId, connection);
    return connection;
  }
}
```

### Tenant Resolution
- Extract from subdomain: `company.axovion.io`
- Fallback to `x-tenant-id` header for API
- Skip for `www`, `axovion`, `api` subdomains
- Lookup in admin DB, attach to request

### Scaling
- 0-100 tenants: Single M10 cluster
- 100-500 tenants: M30 cluster
- 500+ tenants: Sharding by tenant_id prefix

---

## COMPLETE MODULE SPECIFICATIONS

### 1. AUTH MODULE
**Endpoints:**
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/google
GET  /api/v1/auth/me
POST /api/v1/auth/api-keys
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

**JWT Payload:**
```typescript
interface JwtPayload {
  sub: string;        // userId
  email: string;
  tenantId: string;
  role: 'super_admin' | 'tenant_admin' | 'agent' | 'viewer';
}
```

**Features:**
- Password reset via email (Resend)
- Google OAuth integration
- API key generation for integrations
- Session expiry: 7 days
- Refresh token rotation

### 2. TENANT MODULE
**Endpoints:**
```
POST   /api/v1/tenants              (super_admin)
GET    /api/v1/tenants              (super_admin)
GET    /api/v1/tenants/:id          (super_admin, tenant_admin)
PUT    /api/v1/tenants/:id          (super_admin, tenant_admin)
DELETE /api/v1/tenants/:id          (super_admin)
GET    /api/v1/tenants/by-subdomain/:subdomain
```

**Tenant Schema:**
```typescript
interface Tenant {
  id: string;
  subdomain: string;          // unique
  name: string;
  description?: string;
  status: 'active' | 'suspended' | 'pending';
  plan: 'starter' | 'growth' | 'pro' | 'enterprise';
  databaseName: string;       // auto-generated
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  settings: {
    businessHours: { start: string; end: string; timezone: string };
    aiAgent: AIAgentConfig;
    branding: { logo?: string; primaryColor?: string };
  };
  allowedOrigins: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

**Onboarding Flow:**
1. Sign up (email, password, company name, plan)
2. Stripe checkout
3. Generate subdomain
4. Create tenant database
5. Provision Twilio phone number
6. Send welcome email
7. Schedule 30-min onboarding call
8. Tenant goes live

### 3. USER MODULE (Team Management)
**Endpoints:**
```
POST   /api/v1/users/invite          (tenant_admin)
GET    /api/v1/users                 (all roles)
GET    /api/v1/users/:id             (all roles)
PUT    /api/v1/users/:id             (tenant_admin, self)
DELETE /api/v1/users/:id             (tenant_admin)
PUT    /api/v1/users/:id/role        (tenant_admin)
```

**User Schema:**
```typescript
interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: 'super_admin' | 'tenant_admin' | 'agent' | 'viewer';
  isActive: boolean;
  lastLoginAt?: Date;
  preferences: {
    notifications: { email: boolean; inApp: boolean; push: boolean };
    theme: 'light' | 'dark';
  };
}
```

### 4. CONTACT MODULE
**Endpoints:**
```
POST   /api/v1/contacts
GET    /api/v1/contacts?status=&tags=&assignedTo=&search=
GET    /api/v1/contacts/:id
PUT    /api/v1/contacts/:id
DELETE /api/v1/contacts/:id
POST   /api/v1/contacts/import       (CSV bulk import)
GET    /api/v1/contacts/:id/timeline
POST   /api/v1/contacts/:id/notes
GET    /api/v1/contacts/search?q=
```

**Contact Schema:**
```typescript
interface Contact {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  phone: string;              // primary identifier for dedup
  company?: string;
  status: 'lead' | 'prospect' | 'customer' | 'churned';
  tags: string[];
  customFields: Record<string, any>;
  source: { channel: string; campaign?: string; landingPage?: string };
  assignedTo?: string;        // agentId
  lastContactedAt?: Date;
  createdAt: Date;
}
```

**Features:**
- Phone-based deduplication (primary for Pakistan)
- Email secondary matching
- CSV import with validation and error report
- Contact timeline: all interactions chronological
- Assignment: round-robin or manual
- Merge suggestions

### 5. CONVERSATION MODULE
**Endpoints:**
```
POST   /api/v1/conversations
GET    /api/v1/conversations?status=&channel=&assignedTo=
GET    /api/v1/conversations/:id
PUT    /api/v1/conversations/:id
POST   /api/v1/conversations/:id/messages
PUT    /api/v1/conversations/:id/assign
PUT    /api/v1/conversations/:id/status
PUT    /api/v1/conversations/:id/resolve
POST   /api/v1/conversations/:id/handoff
```

**Conversation States:**
```
[NEW] → AI handles → [ACTIVE]
              |
              v
        [HANDOFF_REQUESTED] → agent accepts → [HUMAN_HANDLING]
              |                                    |
              | agent declines/no response         v
              |                            human resolves → [RESOLVED]
              |                                    |
              v                                    v
        [AI_CONTINUING] ← customer messages ← [REOPENED]
```

**Message Schema:**
```typescript
interface Message {
  id: string;
  conversationId: string;
  senderType: 'contact' | 'ai' | 'agent' | 'system';
  agentId?: string;
  content: string;
  channel: 'voice' | 'whatsapp' | 'email' | 'web';
  metadata?: {
    model?: string;
    provider?: string;
    latency?: number;
    tokens?: number;
  };
  createdAt: Date;
}
```

### 6. AI AGENT MODULE
**Endpoints:**
```
GET    /api/v1/ai-agents/config
PUT    /api/v1/ai-agents/config
POST   /api/v1/ai-agents/test        (test chat)
GET    /api/v1/ai-agents/templates
POST   /api/v1/ai-agents/:id/prompt  (custom prompt)
```

**AI Agent Config:**
```typescript
interface AIAgentConfig {
  name: string;
  type: 'sales' | 'support' | 'general';
  tone: 'professional' | 'friendly' | 'casual';
  greeting: string;
  systemPrompt: string;
  knowledgeBase: {
    documents: string[];      // R2 URLs
    websiteUrl?: string;
    faqEntries: { question: string; answer: string }[];
  };
  handoffTriggers: {
    onRequest: boolean;
    onNegativeSentiment: boolean;
    onRepeatedFailure: boolean;
    maxAttempts: number;
  };
  businessHoursOnly: boolean;
  languages: string[];        // ['en', 'ur']
}
```

**System Prompt Template:**
```
You are {{agentName}}, an AI assistant for {{companyName}}.

TONE: {{tone}}
- Professional: Formal, concise, no filler words
- Friendly: Warm, conversational, occasional enthusiasm
- Casual: Relaxed, brief, emoji acceptable

BUSINESS INFO:
{{companyDescription}}

KNOWLEDGE BASE:
{{faqContext}}

INSTRUCTIONS:
1. Always be helpful and accurate
2. If unsure, say "Let me connect you with a team member"
3. For complex issues, offer human handoff
4. Respond in the same language as the customer
5. Keep responses concise (2-3 sentences for chat, 1-2 for voice)

CURRENT CONTEXT:
- Time: {{currentTime}}
- Business hours: {{businessHours}}
- Customer: {{customerName}} ({{customerHistory}})
```

**Context Management:**
- Last 5 messages per conversation
- 48-hour rolling window
- Stored in MongoDB, cached in Redis (1h TTL)
- Contact summary for returning customers

**Handoff Triggers:**
1. Explicit request: "human", "agent", "talk to person"
2. Negative sentiment (detected via Groq)
3. Repeated failure: 3 consecutive unsatisfactory AI responses
4. Complex intent: booking, complaint, refund

**Fallback Strategy:**
```typescript
const providers = [
  { name: 'groq', model: 'llama-3.3-70b', weight: 100, timeout: 5000 },
  { name: 'openai', model: 'gpt-4o-mini', weight: 20, timeout: 5000 },
  { name: 'together', model: 'llama-3.3-70b', weight: 10, timeout: 5000 },
];
```

**Voice Pipeline:**
```
Customer speaks
→ Twilio Media Stream (WebSocket)
→ Audio chunk accumulation (100-200ms)
→ Whisper STT transcription
→ Text + context → Groq LLM
→ AI response text
→ ElevenLabs TTS
→ Audio stream → Twilio
→ Customer hears response
```

**Language Detection:**
```typescript
async function detectLanguage(message: string): Promise<string> {
  const prompt = `Detect language. Reply with ISO 639-1 code only (en, ur, ar):\n\n${message}`;
  const response = await groq.complete(prompt, { maxTokens: 5 });
  return response.trim().toLowerCase() || 'en';
}
```

### 7. VOICE MODULE (Twilio Integration)
**Endpoints:**
```
POST /api/v1/voice/inbound          (Twilio webhook)
POST /api/v1/voice/outbound         (initiate call)
POST /api/v1/voice/status           (Twilio status callback)
POST /api/v1/voice/recording        (recording callback)
GET  /api/v1/voice/calls            (list calls)
GET  /api/v1/voice/calls/:id
```

**Features:**
- Inbound call handling with AI greeting
- Outbound call initiation from dashboard
- Real-time transcription (Whisper)
- Call recording storage (R2, auto-delete after transcription)
- Warm transfer via Twilio `<Dial>`
- Concurrent call limits per plan
- Call analytics: duration, outcome, sentiment

**Call States:**
```
[dialing] → [ringing] → [in-progress] → [completed|failed|busy|no-answer]
                              |
                              v
                        [transferring] → [transferred]
```

### 8. WHATSAPP MODULE
**Endpoints:**
```
POST /api/v1/whatsapp/inbound       (Twilio webhook)
POST /api/v1/whatsapp/outbound      (send message)
POST /api/v1/whatsapp/broadcast     (bulk send)
GET  /api/v1/whatsapp/templates     (list templates)
POST /api/v1/whatsapp/templates     (create template)
```

**Features:**
- Send/receive text, images, documents, voice notes
- Message templates (pre-approved for outbound)
- Broadcast to contact segments
- Auto-reply with AI
- Media download and storage (R2)
- Message status tracking: sent → delivered → read → failed
- Opt-in/opt-out compliance
- Voice notes: transcribe with Whisper, respond with text

### 9. EMAIL MODULE (Resend)
**Endpoints:**
```
POST /api/v1/email/send             (transactional)
POST /api/v1/email/sequences        (create drip campaign)
GET  /api/v1/email/sequences/:id
POST /api/v1/email/sequences/:id/trigger
GET  /api/v1/email/analytics
```

**Features:**
- HTML email templates with variables
- Drip campaigns with delays and conditions
- Open/click tracking
- Bounce handling
- Bulk email to segments
- Email threading with conversations

### 10. WEB CHAT WIDGET
**Implementation:** Embeddable JavaScript snippet

**Features:**
- Custom branding (colors, logo, greeting) per tenant
- AI-powered responses with context
- Lead capture (name, email, phone)
- File upload support
- Chat history persistence
- Human handoff with full context
- Typing indicators
- Mobile-responsive

**Embed Code:**
```html
<script src="https://axovion.io/widget.js" data-tenant="tenant-id"></script>
```

### 11. NOTIFICATIONS MODULE
**Channels:**
- In-app (WebSocket real-time)
- Email (Resend)
- Browser push (optional post-MVP)

**Notification Types:**
- New message assigned
- Handoff requested
- SLA breach warning
- Billing alert (low credits, invoice due)
- Mention in note

**Preferences:** Per-user settings for each channel/type

### 12. ANALYTICS MODULE
**Dashboards:**

**Admin Dashboard:**
- Total tenants, MRR, churn rate
- System health: API latency, error rates
- AI provider performance
- Revenue by plan

**Tenant Dashboard:**
- Total/active conversations
- Contact growth (line chart)
- Channel breakdown (pie chart)
- AI vs human resolution rate
- Average response time
- Agent performance leaderboard
- SLA compliance rate
- Sentiment distribution

**Agent Dashboard:**
- My conversations (active, resolved today)
- Response time average
- Customer satisfaction
- Handoff acceptance rate

**Date Ranges:** Today, 7 days, 30 days, custom
**Export:** PDF reports, CSV data

### 13. BILLING MODULE
**Endpoints:**
```
GET  /api/v1/billing/subscription
PUT  /api/v1/billing/subscription   (upgrade/downgrade)
GET  /api/v1/billing/invoices
GET  /api/v1/billing/usage
POST /api/v1/billing/credits        (purchase)
POST /api/v1/billing/webhook        (Stripe)
```

**Credit System:**
```typescript
interface CreditTransaction {
  tenantId: string;
  amount: number;           // cents, positive = purchase, negative = usage
  type: 'purchase' | 'usage' | 'refund' | 'expiry';
  description: string;
  expiresAt?: Date;
  createdAt: Date;
}
```

**Rules:**
- Deduct from oldest credits first (FIFO)
- Monthly expiry job
- Email notification at 30 days and 7 days before expiry
- Overage: $0.04/minute, billed on next cycle

**Stripe Webhooks:**
- `invoice.paid` → subscription active
- `invoice.payment_failed` → retry or suspend
- `customer.subscription.deleted` → cancel
- `customer.subscription.updated` → plan change

### 14. WORKFLOW/AUTOMATION MODULE
**Visual Workflow Builder:**
- Drag-and-drop canvas
- Nodes: Trigger, Action, Condition, Delay
- Triggers: New contact, new conversation, status change, tag added, time-based
- Actions: Send message, assign agent, add tag, update field, send email, webhook
- Conditions: If/then/else on contact/conversation fields

**Templates:**
- Welcome series (new contact)
- Re-engagement (inactive contacts)
- Follow-up (post-call)
- Escalation (SLA breach)

### 15. DOCUMENTS MODULE
**Endpoints:**
```
POST /api/v1/documents              (upload)
GET  /api/v1/documents
GET  /api/v1/documents/:id
DELETE /api/v1/documents/:id
```

**Features:**
- Upload: PDF, Word, CSV, images (max 10MB)
- Storage: Cloudflare R2
- Organization: Folders per contact/conversation
- Share links with expiry
- Text extraction: pdf-parse, mammoth, csv-parser
- Index into AI knowledge base

### 16. WEBHOOKS MODULE
**Endpoints:**
```
POST /api/v1/webhooks
GET  /api/v1/webhooks
PUT  /api/v1/webhooks/:id
DELETE /api/v1/webhooks/:id
POST /api/v1/webhooks/:id/test
POST /api/v1/webhooks/deliver      (internal)
```

**Features:**
- Event selection: contact.created, conversation.updated, call.ended, etc.
- HMAC-SHA256 signature
- Exponential backoff: 1s, 2s, 4s, 8s, 16s
- 5 retries, then dead letter queue
- Manual retry UI
- Delivery logs

### 17. SETTINGS MODULE
**Tenant Settings:**
- Business hours + timezone
- AI agent configuration
- Branding (logo, primary color on Pro+)
- Notification preferences
- Integration credentials (Twilio, WhatsApp, Stripe)
- API keys

**User Settings:**
- Profile (name, email, password)
- Notification preferences
- Theme (light/dark)

### 18. SYSTEM/ADMIN MODULE
**Super Admin Only:**
- Tenant management (create, suspend, delete)
- System analytics
- Feature flags (tenant-level boolean)
- Audit logs (all actions with user, timestamp, tenant)
- Rate limit management

---

## FRONTEND PAGES (ALL MUST BE FULLY FUNCTIONAL)

### Public
- `/` — Landing page (value prop, features, pricing, CTA)
- `/pricing` — Plan comparison table
- `/login` — Email + Google OAuth
- `/register` — Sign up with plan selection
- `/forgot-password` — Email reset link

### Authenticated — Dashboard Layout
- `/dashboard` — Role-aware widgets, stats, quick actions
- `/conversations` — Unified inbox with filters
- `/conversations/:id` — Detail view with message thread, customer context, handoff button
- `/contacts` — List with search, filters, bulk actions
- `/contacts/:id` — Profile + timeline + notes + deals
- `/calls` — Active calls grid, call history, initiate outbound
- `/deals` — Pipeline board (Kanban), deal detail
- `/analytics` — Charts, reports, export

### Authenticated — Admin/Tenant Admin
- `/team` — Invite users, manage roles, deactivate
- `/billing` — Subscription, usage, invoices, payment methods
- `/settings` — General, AI agent, branding, integrations, API keys
- `/workflows` — Visual builder, templates, active workflows
- `/documents` — File manager, upload, organization

### Authenticated — Agent
- `/my-conversations` — Assigned + available
- `/my-performance` — Stats, response times

---

## DATABASE INDEXES (REQUIRED)

```javascript
// contacts
db.contacts.createIndex({ tenantId: 1, phone: 1 }, { unique: true });
db.contacts.createIndex({ tenantId: 1, email: 1 });
db.contacts.createIndex({ tenantId: 1, status: 1 });
db.contacts.createIndex({ tenantId: 1, assignedTo: 1 });
db.contacts.createIndex({ tenantId: 1, createdAt: -1 });
db.contacts.createIndex({ tenantId: 1, tags: 1 });

// conversations
db.conversations.createIndex({ tenantId: 1, status: 1 });
db.conversations.createIndex({ tenantId: 1, contactId: 1 });
db.conversations.createIndex({ tenantId: 1, assignedTo: 1 });
db.conversations.createIndex({ tenantId: 1, updatedAt: -1 });
db.conversations.createIndex({ tenantId: 1, channel: 1 });

// messages
db.messages.createIndex({ conversationId: 1, createdAt: -1 });
db.messages.createIndex({ tenantId: 1, senderType: 1 });

// calls
db.calls.createIndex({ tenantId: 1, status: 1 });
db.calls.createIndex({ tenantId: 1, contactId: 1 });
db.calls.createIndex({ tenantId: 1, createdAt: -1 });

// deals
db.deals.createIndex({ tenantId: 1, stage: 1 });
db.deals.createIndex({ tenantId: 1, contactId: 1 });
db.deals.createIndex({ tenantId: 1, assignedTo: 1 });

// users
db.users.createIndex({ tenantId: 1, email: 1 }, { unique: true });
db.users.createIndex({ tenantId: 1, role: 1 });

// analytics
db.analytics.createIndex({ tenantId: 1, eventType: 1, createdAt: -1 });
```

---

## REDIS CACHE STRATEGY

```
Key Pattern                          | TTL       | Purpose
tenant:{id}:config                   | 5 min     | Tenant settings
tenant:{id}:users                    | 10 min    | Team list
context:{conversationId}             | 1 hour    | Last 5 messages
rate_limit:{tenantId}:{endpoint}     | 1 hour    | API rate limiting
session:{token}                      | 7 days    | Auth sessions
websocket:{userId}                   | session   | Socket connections
```

---

## RATE LIMITING

| Plan | API Requests/Hour | Concurrent Calls | Messages/Min |
|------|------------------|------------------|--------------|
| Starter | 500 | 10 | 60 |
| Growth | 2,000 | 20 | 120 |
| Pro | 10,000 | 50 | 300 |
| Enterprise | Unlimited | 100+ | Unlimited |

---

## SECURITY REQUIREMENTS

- **Data encryption:** TLS 1.3 in transit, AES-256 at rest
- **Field-level encryption:** For sensitive fields (SSN, payment info)
- **Audit logs:** Every action logged with userId, tenantId, timestamp, IP
- **Rate limiting:** Per tenant + per user
- **IP whitelisting:** Optional for API access
- **2FA:** TOTP-based (optional for MVP, required for admin)
- **Password policy:** Min 8 chars, 1 uppercase, 1 number, 1 special
- **CORS:** Strict origin checking per tenant
- **Input validation:** Zod schemas on all inputs
- **SQL/NoSQL injection prevention:** Parameterized queries only
- **XSS protection:** Helmet.js, CSP headers

---

## MVP SUCCESS CRITERIA

- 10 paying customers within 30 days of launch
- <$1,000/month infrastructure cost
- >90% uptime
- <2s average AI response time
- >80% customer satisfaction (onboarding call feedback)

---

## IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1)
1. Fix monorepo — ensure api and web run independently
2. Implement database-per-tenant connection switching
3. Complete auth (register, login, JWT, password reset, Google OAuth)
4. Complete RBAC middleware
5. Seed default super admin

### Phase 2: Core CRM (Week 2)
1. Contacts (CRUD, import, search, timeline, assignment)
2. Conversations (unified inbox, threading, status, assignment)
3. Users (invite, roles, team management)
4. Frontend: contacts, conversations, contact detail, conversation detail

### Phase 3: AI & Channels (Week 3)
1. Twilio integration (voice calls, WhatsApp)
2. ElevenLabs voice synthesis
3. Groq conversation handling with memory
4. Web chat widget
5. Call recording and transcription
6. AI handoff logic

### Phase 4: Automation (Week 4)
1. Email automation with Resend
2. Notifications (in-app, email, push)
3. Workflow engine
4. Webhook system

### Phase 5: Billing & Analytics (Week 5)
1. Stripe integration
2. Credit system
3. Analytics aggregation
4. Dashboard charts
5. Export functionality

### Phase 6: Polish & Deploy (Week 6)
1. Landing page
2. Pricing page
3. Settings (all tabs)
4. Admin panel
5. Security hardening
6. Docker optimization
7. CI/CD pipeline
8. Documentation

---

## EXISTING CODE GAPS

The repo has scaffolded modules but these are NOT implemented:

**Backend:**
- ❌ Database-per-tenant (uses single DB)
- ❌ Twilio voice integration
- ❌ ElevenLabs TTS
- ❌ Whisper STT
- ❌ WhatsApp Business API
- ❌ Stripe billing
- ❌ Resend email sequences
- ❌ R2 file storage
- ❌ Workflow engine
- ❌ Webhook delivery with retries
- ❌ Audit logging
- ❌ Rate limiting
- ❌ Google OAuth
- ❌ Password reset
- ❌ API key management

**Frontend:**
- ❌ All pages are shells with placeholder content
- ❌ No real API integration
- ❌ No conversation detail view
- ❌ No contact timeline
- ❌ No real-time WebSocket updates
- ❌ No admin pages
- ❌ No landing/pricing pages
- ❌ No deal pipeline
- ❌ No call controls
- ❌ No analytics charts

---

## CODE QUALITY REQUIREMENTS

- TypeScript strict mode
- No `any` types
- Class-validator DTOs on all endpoints
- Consistent error responses
- Structured logging with tenant/user context
- Unit tests for services
- Integration tests for API
- Swagger/OpenAPI docs at `/api/docs`

---

## ENVIRONMENT VARIABLES

See `apps/api/.env.example` in repo. All must be set:

```
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017
REDIS_URL=redis://localhost:6379
JWT_SECRET=
JWT_EXPIRATION=7d
R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
GROQ_API_KEY=
OPENAI_API_KEY=
TOGETHER_API_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_GROWTH=
STRIPE_PRICE_PRO=
STRIPE_PRICE_ENTERPRISE=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SENTRY_DSN=
```

---

## DELIVERABLES

1. Fully functional backend at `apps/api/`
2. Fully functional frontend at `apps/web/`
3. Shared types at `packages/shared/`
4. Docker Compose runs entire stack
5. Environment templates
6. Database seeds
7. Swagger API docs
8. GitHub Actions CI/CD
9. Complete README

---

## CRITICAL REMINDERS

- **Do NOT skip any feature.** Every item above must be production-ready.
- **Do NOT leave TODOs or placeholders.**
- **Test every endpoint.**
- **Test every page.**
- **Enforce tenant isolation everywhere.**
- **Commit regularly.**
- **Ask if unclear — do not guess.**

---

## REFERENCE DOCUMENTS

The following architecture docs exist in the `axovion-crm` repo (separate from code repo) and contain additional implementation details:
- `ai-agents.md` — AI provider stack, prompt templates, context management
- `ai-orchestration.md` — Message flow, handoff logic, event bus, queues
- `backend.md` — Module structure, API patterns
- `frontend.md` — Component structure, state management
- `tenancy.md` — Database-per-tenant deep dive
- `billing.md` — Credit system, Stripe integration
- `workflows.md` — All business process flows
- `mvp.md` — MVP scope and success criteria

Clone: `https://github.com/joking-really/axovion-crm`

---

**For questions:** Contact Metawib (Axovion Founder) — axovion.io
