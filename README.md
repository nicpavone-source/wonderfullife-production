# WonderfulLife Production Repository v1.0

Clean deployable Next.js production repository for WonderfulLife.ca.

## Included
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase authentication
- Supabase database schema
- Public content pages
- Articles, recipes, videos
- Member dashboard
- Wellness journey
- Ask Zoey API route
- Studio content creation
- Vercel deployment config
- GitHub Actions CI

## Required Vercel environment variables

```env
NEXT_PUBLIC_SITE_URL=https://wonderfullife.ca
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_MODEL=gpt-4.1-mini
```

Optional:

```env
OPENAI_API_KEY=your_openai_api_key
```

## Supabase
Run `database/schema.sql` in Supabase SQL Editor.

## Deploy
Push this repository to GitHub. Vercel will detect Next.js automatically.
