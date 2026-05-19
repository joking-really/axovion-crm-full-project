# AXOVION CRM — COMPLETE BUILD INSTRUCTIONS FOR KIMI K2.6 AGENT SWARM

## PROJECT OVERVIEW

Build a **production-ready, multi-tenant AI SaaS CRM** called **Axovion (axovion.io)**. This is a Pakistan-first product with global expansion potential. The project is partially scaffolded at `https://github.com/joking-really/axovion-crm-full-project` — clone this repo and COMPLETE every feature listed below. Do not leave any feature unfinished or marked as "TODO" or "coming soon."

---

## ARCHITECTURE LOCK

These decisions are **non-negotiable**:

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| Backend | NestJS + FastAPI (hybrid) |
| Database | MongoDB Atlas with database-per-tenant isolation |
| Cache/Queue | Redis + BullMQ |
| Real-time | Socket.IO with Redis Adapter |
| AI Voice | Twilio + ElevenLabs + Groq |
| Email | Resend |
| File Storage | Cloudflare R2 (S3-compatible) |
| Billing | Stripe |
| Deployment | Docker + Docker Compose on AWS EC2 Singapore |
| CDN | Cloudflare |
| CI/CD | GitHub Actions |
| Monitoring | UptimeRobot + Sentry + Grafana |

---

## COMPLETE FEATURE LIST — ALL MUST BE IMPLEMENTED

### 1. MULTI-TENANCY (CRITICAL)
- **Subdomain per tenant**: `tenant1.axovion.io`, `tenant2.axovion.io`
- **Database-per-tenant**: Each tenant gets isolated MongoDB database
- **Tenant middleware**: Extract tenant from subdomain or `x-tenant-id` header
- **Tenant onboarding flow**: Sign up → create tenant → assign subdomain → provision database
- **Tenant admin panel**: Manage settings, users, billing, integrations per tenant
- **Cross-tenant data isolation**: Enforce at middleware + service layer

### 2. AUTHENTICATION & RBAC
- **4 Roles**: Super Admin, Tenant Admin, Agent, Viewer
- **Auth methods**: Email/password + Google OAuth
- **JWT tokens** with tenant context
- **Role-based access control** on all API endpoints
- **Password reset** via email
- **Session management** with expiry

### 3. CONTACT MANAGEMENT
- **Contact profiles**: Name, email, phone, company, tags, custom fields, source tracking
- **Contact timeline**: All interactions (calls, messages, emails, notes) in chronological view
- **Contact import**: CSV/Excel bulk import with validation
- **Contact segmentation**: Filter by tags, status, source, last activity
- **Contact search**: Full-text search across all fields
- **Contact assignment**: Round-robin or manual assignment to agents
- **Duplicate detection**: Merge suggestions based on email/phone

### 4. CONVERSATION MANAGEMENT
- **Unified inbox**: All channels (WhatsApp, email, voice, SMS, web) in one view
- **Channel indicators**: Visual badge per message source
- **Message threading**: Group related messages
- **Internal notes**: Agent-only notes on conversations
- **Conversation status**: Active, Pending, Resolved, Escalated
- **Assignment**: Assign to agent, transfer between agents
- **Priority levels**: Low, Medium, High, Urgent
- **SLA tracking**: Response time targets per channel

### 5. AI VOICE AGENT (FULL IMPLEMENTATION)
- **Twilio integration**: Inbound + outbound calls
- **ElevenLabs**: Natural voice synthesis with multiple voice options
- **Groq LLM**: Real-time conversation handling
- **Call flows**: Greeting → intent detection → information collection → booking/action → handoff
- **Call recording**: Store recordings in R2, link to contact timeline
- **Call transcription**: Transcribe calls, store text in conversation
- **Voice customization**: Per-tenant voice selection, language (English + Urdu support)
- **Call analytics**: Duration, outcome, sentiment, drop-off points
- **Warm transfer**: AI → human handoff with context summary
- **Outbound campaigns**: Scheduled call campaigns with contact lists

### 6. WHATSAPP AUTOMATION
- **Twilio WhatsApp API**: Send/receive messages
- **Message templates**: Pre-approved templates for outbound
- **Auto-reply**: AI-powered instant responses
- **Broadcast messages**: Send to contact segments
- **Media support**: Images, documents, voice notes
- **Message status**: Sent, Delivered, Read, Failed
- **Opt-in/opt-out management**: Compliance handling

### 7. EMAIL AUTOMATION
- **Resend integration**: Transactional + marketing emails
- **Email templates**: HTML editor with variables
- **Sequences**: Drip campaigns with delays and conditions
- **Email tracking**: Open rates, click rates, bounce handling
- **Bulk email**: Send to segments
- **Email threading**: Link emails to contact conversations

### 8. AI CHATBOT (WEB WIDGET)
- **Embeddable widget**: JavaScript snippet for client websites
- **Custom branding**: Colors, logo, greeting per tenant
- **AI responses**: Groq-powered with context awareness
- **Lead capture**: Collect name, email, phone before/during chat
- **File sharing**: Allow document upload in chat
- **Chat history**: Persist across sessions
- **Handoff**: Chat → human agent with full context
- **Typing indicators**: Show when AI/agent is typing

### 9. AI MEMORY & CONTEXT
- **Short-term memory**: Last 5 conversations per contact
- **48-hour window**: Context retention period
- **Contact context**: Previous interactions, preferences, status
- **AI personality**: Professional, helpful, concise
- **Language support**: English UI + Urdu AI responses
- **Sentiment tracking**: Auto-detect and flag negative sentiment
- **Escalation triggers**: Negative sentiment, repeated failure, explicit request

### 10. ANALYTICS & DASHBOARDS
- **Admin Dashboard**: System-wide metrics, tenant health, revenue
- **Tenant Dashboard**: Contacts, conversations, AI usage, agent performance
- **Agent Dashboard**: My conversations, response times, ratings
- **Key metrics**:
  - Total/Active conversations
  - Contact growth
  - AI vs human resolution rate
  - Average response time
  - Channel breakdown (voice, WhatsApp, email, web)
  - Sentiment distribution
  - Agent performance leaderboard
  - SLA compliance rate
- **Charts**: Line charts (trends), bar charts (comparisons), pie charts (distribution)
- **Date range filtering**: Today, 7 days, 30 days, custom
- **Export**: PDF reports, CSV data export

### 11. BILLING & SUBSCRIPTIONS
- **Pricing tiers**:
  - Starter: $49/user/month
  - Professional: $79/user/month
  - Enterprise: $149/user/month
  - Custom: $349+/user/month
- **Hybrid pricing**: Subscription base + usage credits
- **Credit system**: AI calls, messages, emails consume credits
- **12-month rolling expiry**: Credits expire if unused
- **Stripe integration**: Subscriptions, invoices, payment methods
- **Billing dashboard**: Usage tracking, upcoming invoices, payment history
- **Upgrade/downgrade**: Prorated billing
- **Trial period**: 14-day free trial
- **Webhook handling**: Stripe events for subscription changes

### 12. NOTIFICATIONS
- **In-app notifications**: Real-time via WebSocket
- **Email notifications**: Assignment, escalation, mentions
- **Push notifications**: Browser push for web
- **Notification preferences**: Per-user settings
- **Notification types**: New message, assignment, escalation, SLA breach, billing

### 13. WORKFLOWS & AUTOMATION
- **Visual workflow builder**: Drag-and-drop automation rules
- **Triggers**: New contact, new conversation, status change, tag added, time-based
- **Actions**: Send message, assign agent, add tag, update field, send email, webhook
- **Conditions**: If/then/else logic
- **Workflow templates**: Pre-built for common use cases

### 14. DOCUMENTS & FILES
- **File upload**: PDF, Word, CSV, images
- **Cloudflare R2 storage**: Secure file storage
- **File organization**: Folders per contact/conversation
- **File sharing**: Share links with expiry
- **Document parsing**: Extract text from PDFs (future: OCR)

### 15. INTEGRATIONS
- **Webhooks**: Outbound webhooks for all major events
- **Zapier/Make.com**: Pre-built connectors
- **API access**: Full REST API with documentation
- **API keys**: Per-tenant API key management

### 16. SECURITY
- **Data encryption**: At rest and in transit
- **Field-level encryption**: For sensitive data
- **Audit logs**: All actions logged with user, timestamp, tenant
- **Rate limiting**: Per tenant and per user
- **IP whitelisting**: Optional for API access
- **2FA**: TOTP-based two-factor authentication
- **Data retention policies**: Auto-delete old data per settings

### 17. DEPLOYMENT & DEVOPS
- **Docker Compose**: Full local development environment
- **Production Docker**: Optimized multi-stage builds
- **GitHub Actions**: CI/CD pipeline (test → build → deploy)
- **Environment management**: dev, staging, production
- **Health checks**: API and service health endpoints
- **Log aggregation**: Structured logging with correlation IDs
- **Backup strategy**: Automated MongoDB backups

### 18. FRONTEND PAGES (ALL MUST BE FULLY FUNCTIONAL)

**Public:**
- Landing page (axovion.io)
- Pricing page
- Login/Register
- Forgot password

**Authenticated — Shared (all roles):**
- Dashboard (role-aware widgets)
- Conversations (unified inbox)
- Contacts (list, detail, timeline)
- Settings (profile, notifications, integrations)

**Authenticated — Admin/Tenant Admin:**
- Team management (invite, roles, deactivate)
- Billing & subscription management
- Tenant settings (branding, hours, auto-reply)
- Analytics & reports
- Workflow builder
- API keys management

**Authenticated — Agent:**
- My conversations
- Contact list (assigned + unassigned)
- Performance stats

---

## EXISTING CODEBASE NOTES

The repo at `https://github.com/joking-really/axovion-crm-full-project` contains:

**Backend (apps/api/):**
- Scaffolded NestJS project with modules for: auth, tenants, users, contacts, conversations, AI, billing, notifications, analytics, webhooks, websocket
- Each module has basic controller, service, schema
- **Current gaps**: 
  - No database-per-tenant implementation (uses single DB)
  - AI service only has basic Groq chat + sentiment
  - No Twilio/ElevenLabs integration
  - No Stripe integration
  - No Resend email sending
  - No R2 file storage
  - Webhooks are stubs
  - No workflow engine
  - No audit logging
  - Missing many DTOs and validation

**Frontend (apps/web/):**
- Next.js with Tailwind, basic layout
- Pages: login, dashboard, contacts, conversations, settings
- **Current gaps**:
  - All pages are basic shells with placeholder content
  - No actual API integration (except dashboard stats stub)
  - No conversation detail view
  - No contact detail/timeline view
  - No real-time updates via WebSocket
  - No admin-specific pages
  - No landing page
  - No pricing page

**Shared (packages/shared/):**
- Basic TypeScript types
- Needs expansion for all entities

---

## IMPLEMENTATION ORDER (RECOMMENDED)

### Phase 1: Foundation (Week 1)
1. Fix monorepo setup — ensure apps/api and apps/web can run independently
2. Implement proper database-per-tenant connection switching
3. Complete auth system (register, login, JWT, password reset, Google OAuth)
4. Complete RBAC middleware and guards
5. Seed default super admin tenant

### Phase 2: Core CRM (Week 2)
1. Complete contacts module (CRUD, import, search, timeline, assignment)
2. Complete conversations module (unified inbox, threading, status, assignment)
3. Complete users module (invite, roles, team management)
4. Build frontend pages: contacts, conversations, contact detail, conversation detail

### Phase 3: AI & Channels (Week 3)
1. Twilio integration (voice calls, WhatsApp)
2. ElevenLabs voice synthesis
3. Groq conversation handling with memory
4. Web chat widget (embeddable)
5. Call recording and transcription storage
6. AI handoff logic

### Phase 4: Automation (Week 4)
1. Email automation with Resend
2. Notification system (in-app, email, push)
3. Workflow engine (triggers, actions, conditions)
4. Webhook system

### Phase 5: Billing & Analytics (Week 5)
1. Stripe integration (subscriptions, invoices, webhooks)
2. Credit system implementation
3. Analytics aggregation
4. Dashboard charts and reports
5. Export functionality

### Phase 6: Polish & Deploy (Week 6)
1. Landing page
2. Pricing page
3. Settings pages (all tabs)
4. Admin panel
5. Security hardening
6. Docker optimization
7. CI/CD pipeline
8. Documentation

---

## CODE QUALITY REQUIREMENTS

- **TypeScript strict mode** enabled
- **All functions typed** — no `any` types
- **Input validation** on all API endpoints (class-validator DTOs)
- **Error handling** — consistent error responses, proper HTTP codes
- **Logging** — structured logs with tenant/user context
- **Tests** — Unit tests for services, integration tests for API
- **Documentation** — README, API docs (Swagger/OpenAPI), deployment guide

---

## DELIVERABLES

1. **Fully functional backend** at `apps/api/` — all modules complete
2. **Fully functional frontend** at `apps/web/` — all pages complete
3. **Shared types** at `packages/shared/` — complete type definitions
4. **Docker setup** — `docker-compose.yml` runs entire stack with one command
5. **Environment templates** — `.env.example` files with all required variables
6. **Database migrations/seeds** — Initial data setup
7. **API documentation** — Swagger UI at `/api/docs`
8. **Deployment scripts** — GitHub Actions workflow
9. **README** — Setup, development, deployment instructions

---

## CRITICAL REMINDERS

- **Do NOT skip any feature** listed above. Every item must be production-ready.
- **Do NOT leave TODO comments** or placeholder implementations.
- **Test every API endpoint** before marking complete.
- **Test every frontend page** for functionality and responsiveness.
- **Ensure tenant isolation** is enforced everywhere — this is a security requirement.
- **Commit regularly** to the GitHub repo.
- **Ask for clarification** if any requirement is ambiguous — do not guess.

---

## CONTACT

For questions about requirements, contact: Metawib (Axovion Founder)
Company: Axovion (axovion.io)
