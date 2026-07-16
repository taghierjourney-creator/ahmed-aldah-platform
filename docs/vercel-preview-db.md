Vercel Preview DB configuration

Goal
- Ensure each Preview deployment uses an isolated Preview database to prevent PII leakage and cross-preview interference.

Setup (manual steps)
1. Create a Preview database in your cloud provider for each preview environment (or use a template DB).
2. In the Vercel project settings, add a new Environment Variable named PREVIEW_DATABASE_URL and set it to the Preview DB connection string.
3. In the project Environment Variables, set DATABASE_URL to your production DB and PREVIEW_DATABASE_URL for Preview scope only.
4. In `vercel.json` (committed), ensure `preview.env.DATABASE_URL` is sourced from `@preview_database_url` as an example.

Migrations
- Add a deployment hook or a Vercel Build step that runs migrations against PREVIEW_DATABASE_URL during Preview builds. Example build hook (in package.json):

  "scripts": {
    "migrate:preview": "DATABASE_URL=$PREVIEW_DATABASE_URL npx prisma migrate deploy --schema=./prisma/schema.prisma"
  }

Security notes
- Never commit production DB connection strings. Use Vercel's encrypted environment variables feature.
- Fail-closed: if PREVIEW_DATABASE_URL is missing for a preview deploy, the deployment should fail the migration step.

This document is an implementation guide; the actual Vercel project needs to be configured through the Vercel dashboard or API.
