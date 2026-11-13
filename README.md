# Wedding Website

A premium Indian wedding website: an editorial public site, Bride/Groom guest registration, common-QR venue verification, a server-side lucky draw and a private admin dashboard.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Framer Motion and Supabase (PostgreSQL, Auth, Storage), and deployed on Vercel.

```bash
npm install
cp .env.example .env.local      # fill in Supabase keys
npm run dev
npm run check                   # typecheck + lint + tests
```

- Setup and deployment: [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md)
- Architecture: [docs/PROJECT_ARCHITECTURE.md](docs/PROJECT_ARCHITECTURE.md)
- Database: [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)
- Design system: [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)
- Routes: [docs/ROUTE_STRUCTURE.md](docs/ROUTE_STRUCTURE.md)
- Status and test results: [FINAL_PROJECT_REPORT.md](FINAL_PROJECT_REPORT.md)
