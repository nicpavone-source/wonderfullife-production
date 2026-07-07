# WonderfulLife GitHub-Ready Repository

This is the clean, folder-structured Next.js production repository for WonderfulLife.ca.

## Important

After extracting the ZIP, copy the CONTENTS of this folder into your GitHub Desktop repository folder.

The repository root must show:

- app
- components
- lib
- database
- public
- package.json
- next.config.ts
- tailwind.config.ts
- tsconfig.json

## Required Vercel environment variables

NEXT_PUBLIC_SITE_URL=https://wonderfullife.ca
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_MODEL=gpt-4.1-mini

Optional:

OPENAI_API_KEY=your_openai_api_key

## Supabase

Run database/schema.sql in Supabase SQL Editor.

## Deployment

Push this repository to GitHub. Vercel will detect Next.js automatically.
