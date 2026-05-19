# Axovion CRM

Full-stack AI-powered CRM built for multi-tenant SaaS.

## Stack

- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** NestJS + MongoDB (database-per-tenant) + Socket.IO + Redis
- **AI:** Groq (LLM) + ElevenLabs (voice) + Twilio (calls/WhatsApp)
- **Infrastructure:** Docker + Docker Compose + AWS EC2 Singapore

## Project Structure

```
axovion-crm-full-project/
├── apps/
│   ├── web/                 # Next.js frontend
│   └── api/                 # NestJS backend
├── packages/
│   └── shared/              # Shared types & utilities
├── docker-compose.yml
└── package.json
```

## Quick Start

```bash
# Install dependencies
npm install

# Start all services (MongoDB, Redis, API, Web)
docker-compose up -d

# Or run locally
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` in both `apps/web` and `apps/api` directories.

## License

Proprietary - Axovion (axovion.io)
