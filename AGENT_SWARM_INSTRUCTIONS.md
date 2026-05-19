# AXOVION CRM — AGENT SWARM EXECUTION PLAN

## YOUR MISSION

Build a **production-ready, multi-tenant AI SaaS CRM** called **Axovion (axovion.io)**. You have access to two repositories and this instruction document. Read everything carefully before writing any code.

**Time Estimate:** 6 weeks (full-time equivalent)
**Team Size:** 3-5 agents working in parallel
**Output:** Fully functional CRM with all features listed below

---

## STEP 1: READ ALL DOCUMENTATION (DO NOT SKIP)

Before writing any code, clone and read these repositories in order:

### Repository 1: Architecture Docs
```bash
git clone https://github.com/joking-really/axovion-crm.git
cd axovion-crm
```

**Read every file in this order:**
1. `mvp.md` — Understand MVP scope and success criteria
2. `architecture.md` — High-level system design
3. `tenancy.md` — Multi-tenancy strategy (database-per-tenant)
4. `ai-agents.md` — AI provider stack, prompts, context management
5. `ai-orchestration.md` — Message flow, handoff logic, event bus, queues
6. `backend.md` — Backend module structure, API patterns
7. `frontend.md` — Frontend component structure, state management
8. `billing.md` — Credit system, Stripe integration
9. `workflows.md` — All business process flows
10. `auth.md` — Authentication and authorization
11. `security.md` — Security requirements
12. `deployment.md` — Infrastructure and deployment
13. `scaling.md` — Scaling strategy
14. `monitoring.md` — Monitoring and alerting
15. `integrations.md` — Third-party integrations
16. `notifications.md` — Notification system
17. `analytics.md` — Analytics and reporting
18. `queues.md` — Queue management
19. `redis.md` — Redis caching strategy
20. `websocket.md` — WebSocket implementation

**Take notes on:**
- Technology choices and why
- Data models and relationships
- API endpoint patterns
- Business logic rules
- Integration requirements

### Repository 2: Code Scaffold
```bash
git clone https://github.com/joking-really/axovion-crm-full-project.git
cd axovion-crm-full-project
```

**Read these files:**
1. `AGENT_INSTRUCTIONS_V2.md` — Complete feature list with schemas
2. `README.md` — Project structure and quick start
3. `docker-compose.yml` — Infrastructure setup
4. `apps/api/package.json` — Backend dependencies
5. `apps/web/package.json` — Frontend dependencies
6. All files in `apps/api/src/` — Current module structure
7. All files in `apps/web/app/` — Current page structure
8. All files in `packages/shared/` — Shared types

**Identify gaps:**
- What modules exist but are incomplete?
- What modules are completely missing?
- What frontend pages are shells vs functional?

---

## STEP 2: SETUP DEVELOPMENT ENVIRONMENT

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- Git

### Initial Setup
```bash
cd axovion-crm-full-project

# Install root dependencies
npm install

# Install backend dependencies
cd apps/api && npm install && cd ../..

# Install frontend dependencies
cd apps/web && npm install && cd ../..

# Install shared package
cd packages/shared && npm install && cd ../..

# Start infrastructure (MongoDB, Redis)
docker-compose up -d mongodb redis

# Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Fill in required environment variables (see AGENT_INSTRUCTIONS_V2.md)
```

### Environment Variables Required
See `AGENT_INSTRUCTIONS_V2.md` Section "ENVIRONMENT VARIABLES" for complete list.

Minimum required for development:
```
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRATION=7d
```

---

## STEP 3: IMPLEMENTATION PHASES

### PHASE 1: FOUNDATION (Week 1)
**Agents: 2 (Backend focus)**

**Task 1.1: Fix Monorepo Setup**
- Ensure `apps/api` and `apps/web` can run independently
- Fix any dependency conflicts
- Ensure `packages/shared` builds correctly
- Add proper workspace configuration

**Task 1.2: Implement Database-Per-Tenant**
- Create `TenantConnectionService` (see tenancy.md)
- Implement tenant resolution middleware (subdomain + header)
- Create admin database for tenant registry
- Ensure all existing modules use tenant-specific connections
- Add database creation on tenant signup

**Task 1.3: Complete Authentication**
- Email/password registration and login
- JWT token generation with tenant context
- Password reset via email (Resend)
- Google OAuth integration
- Session management with expiry
- API key generation and validation

**Task 1.4: Implement RBAC**
- Role decorator and guard
- Permission checking on all endpoints
- Super admin seed data
- User invitation system

**Deliverables:**
- [ ] Backend runs without errors
- [ ] Tenant isolation working
- [ ] Auth endpoints fully functional
- [ ] RBAC enforced on all routes
- [ ] Tests for auth and tenant modules

---

### PHASE 2: CORE CRM (Week 2)
**Agents: 3 (2 Backend, 1 Frontend)**

**Task 2.1: Complete Contact Module**
- Full CRUD with validation
- CSV bulk import with error handling
- Phone-based deduplication
- Contact timeline (all interactions)
- Assignment (round-robin + manual)
- Search and filtering
- Custom fields support

**Task 2.2: Complete Conversation Module**
- Unified inbox with all channels
- Message threading
- Conversation status management
- Assignment and handoff request
- Internal notes
- SLA tracking

**Task 2.3: Complete User/Team Module**
- User invitation flow
- Role management
- Team listing
- Agent availability status

**Task 2.4: Build Frontend Pages**
- Dashboard with real data
- Contacts list and detail page
- Conversations inbox and detail page
- Contact timeline view
- Proper navigation and layout

**Deliverables:**
- [ ] Contact management fully functional
- [ ] Conversation inbox working
- [ ] Frontend pages connected to API
- [ ] Real data flowing end-to-end

---

### PHASE 3: AI & CHANNELS (Week 3)
**Agents: 3 (2 Backend, 1 Frontend)**

**Task 3.1: Twilio Voice Integration**
- Inbound call webhook handling
- Outbound call initiation
- Call status callbacks
- Recording storage in R2
- Real-time transcription (Whisper)
- Warm transfer via `<Dial>`

**Task 3.2: ElevenLabs Integration**
- Text-to-speech synthesis
- Voice selection per tenant
- Audio streaming to Twilio
- Voice caching

**Task 3.3: Groq AI Integration**
- Conversation context building
- Response generation with fallback
- Sentiment analysis
- Language detection (English + Urdu)
- Handoff trigger detection

**Task 3.4: WhatsApp Integration**
- Twilio WhatsApp webhook
- Message send/receive
- Media handling
- Template messages
- Broadcast to segments
- Status tracking

**Task 3.5: Web Chat Widget**
- Embeddable JavaScript
- Custom branding per tenant
- AI responses
- Lead capture
- Handoff to human

**Task 3.6: Frontend Updates**
- Call controls and monitoring
- WhatsApp conversation view
- Chat widget preview
- AI agent configuration page

**Deliverables:**
- [ ] Voice calls working end-to-end
- [ ] WhatsApp messaging functional
- [ ] AI responses with context
- [ ] Web chat widget embeddable
- [ ] Handoff system working

---

### PHASE 4: AUTOMATION (Week 4)
**Agents: 2 (1 Backend, 1 Frontend)**

**Task 4.1: Email Automation (Resend)**
- Transactional email sending
- HTML template editor
- Drip campaigns with delays
- Open/click tracking
- Bulk email to segments

**Task 4.2: Notification System**
- In-app notifications (WebSocket)
- Email notifications
- Notification preferences per user
- Real-time alert delivery

**Task 4.3: Workflow Engine**
- Visual workflow builder (frontend)
- Trigger system (new contact, status change, time-based)
- Action system (send message, assign, tag, email, webhook)
- Condition logic (if/then/else)
- Workflow templates

**Task 4.4: Webhook System**
- Outbound webhook delivery
- HMAC signature
- Retry with exponential backoff
- Dead letter queue
- Delivery logs

**Deliverables:**
- [ ] Email sequences working
- [ ] Notifications real-time
- [ ] Workflow builder functional
- [ ] Webhooks delivering reliably

---

### PHASE 5: BILLING & ANALYTICS (Week 5)
**Agents: 2 (1 Backend, 1 Frontend)**

**Task 5.1: Stripe Integration**
- Subscription creation and management
- Checkout sessions
- Invoice generation
- Payment method management
- Webhook handling

**Task 5.2: Credit System**
- Credit purchase
- Usage tracking
- FIFO consumption
- Expiry management
- Overage billing

**Task 5.3: Analytics Aggregation**
- Event collection
- Daily rollup jobs
- Dashboard metrics calculation
- Export functionality

**Task 5.4: Frontend Dashboards**
- Admin dashboard
- Tenant dashboard
- Agent dashboard
- Charts and visualizations
- Date range filtering
- PDF/CSV export

**Deliverables:**
- [ ] Billing working with Stripe
- [ ] Credit system functional
- [ ] Analytics dashboards live
- [ ] Export features working

---

### PHASE 6: POLISH & DEPLOY (Week 6)
**Agents: 2 (1 Backend, 1 Frontend)**

**Task 6.1: Landing Page**
- Value proposition
- Feature highlights
- Pricing table
- Testimonials section
- CTA buttons

**Task 6.2: Public Pages**
- Pricing page
- Login/Register pages
- Forgot password flow
- Onboarding wizard

**Task 6.3: Settings Pages**
- Profile settings
- Tenant settings (general, AI, branding, integrations)
- Team management
- Billing management
- API keys

**Task 6.4: Security Hardening**
- Input validation everywhere
- Rate limiting
- CORS configuration
- Security headers
- Audit logging

**Task 6.5: DevOps**
- Docker optimization
- GitHub Actions CI/CD
- Health checks
- Log aggregation
- Backup verification

**Task 6.6: Documentation**
- API documentation (Swagger)
- Setup guide
- Deployment guide
- Architecture overview

**Deliverables:**
- [ ] Landing page live
- [ ] All settings functional
- [ ] Security audit passed
- [ ] CI/CD pipeline working
- [ ] Documentation complete

---

## STEP 4: AGENT COORDINATION RULES

### Communication
- Use GitHub Issues for task tracking
- Comment on complex logic decisions
- Share database schema changes immediately
- Coordinate API contract changes

### Code Standards
- TypeScript strict mode — no exceptions
- No `any` types
- All functions must have return types
- All API endpoints must have DTO validation
- Consistent error handling pattern
- Structured logging with context

### Git Workflow
- Create feature branches: `feature/module-name`
- Commit frequently with descriptive messages
- Pull request for each module completion
- Code review before merge
- Keep main branch deployable

### Testing Requirements
- Unit tests for all services
- Integration tests for API endpoints
- Frontend component tests
- End-to-end tests for critical flows

### Definition of Done
- [ ] Code written and tested
- [ ] API documented in Swagger
- [ ] Frontend connected and working
- [ ] Error handling implemented
- [ ] Logging added
- [ ] No TODOs or placeholders remaining
- [ ] Code reviewed and merged

---

## STEP 5: QUALITY CHECKLIST

Before declaring complete, verify:

### Backend
- [ ] All 18 modules functional
- [ ] All API endpoints return correct responses
- [ ] Tenant isolation enforced
- [ ] RBAC working on all routes
- [ ] Error handling consistent
- [ ] Logging comprehensive
- [ ] Tests passing

### Frontend
- [ ] All pages functional
- [ ] Responsive design
- [ ] Real-time updates working
- [ ] Forms validated
- [ ] Error states handled
- [ ] Loading states added

### Integration
- [ ] Twilio voice calls working
- [ ] WhatsApp messages sending/receiving
- [ ] AI responses contextual
- [ ] Handoff smooth
- [ ] Stripe billing functional
- [ ] Email sequences working

### DevOps
- [ ] Docker Compose runs everything
- [ ] CI/CD pipeline green
- [ ] Environment variables documented
- [ ] Backup strategy tested
- [ ] Monitoring alerts configured

---

## CRITICAL REMINDERS

1. **Read first, code second.** Do not skip the documentation reading phase.
2. **No shortcuts.** Every feature must be production-ready.
3. **Tenant isolation is sacred.** Never leak data between tenants.
4. **Test everything.** Untested code is broken code.
5. **Commit often.** Push to GitHub daily.
6. **Ask questions.** If requirements are unclear, ask before guessing.
7. **No scope creep.** Stick to the features listed. Defer extras to post-MVP.

---

## SUPPORT

For questions about requirements:
- Review the architecture docs in `axovion-crm` repo
- Check `AGENT_INSTRUCTIONS_V2.md` in `axovion-crm-full-project` repo
- Contact: Metawib (Axovion Founder) — axovion.io

---

## SUCCESS CRITERIA

The project is complete when:
- 10+ paying customers can onboard and use the system
- AI handles voice, WhatsApp, and web chat
- Human handoff works seamlessly
- Billing charges correctly
- Dashboard shows real analytics
- System runs on Docker with one command
- All tests pass
- Documentation is complete

**Good luck. Build something great.**
