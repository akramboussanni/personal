# Personal portfolio

Next.js portfolio with a protected content manager for site settings, projects, blog posts, and hosted files.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/akramboussanni/personal&env=PORTFOLIO_ADMIN_USERNAME,PORTFOLIO_ADMIN_PASSWORD,PORTFOLIO_ADMIN_SESSION_SECRET&envDescription=Admin%20credentials%20and%20session%20signing%20secret&envLink=https://github.com/akramboussanni/personal/blob/main/.env.example)

After importing the project:

1. Create a Vercel Blob store and connect it to the project. This provides `BLOB_READ_WRITE_TOKEN`.
2. Set `PORTFOLIO_ADMIN_USERNAME`, `PORTFOLIO_ADMIN_PASSWORD`, and `PORTFOLIO_ADMIN_SESSION_SECRET` in the Vercel project environment settings.
3. Redeploy, then open `/manage` to edit the site.

Blob storage is required on Vercel because its function filesystem is ephemeral. The app stores both JSON content and uploaded files in Blob under `portfolio/content/` and `portfolio/files/`.

## Local development

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Local development can use the filesystem fallback by leaving `BLOB_READ_WRITE_TOKEN` empty. Runtime JSON is written to `CONTENT_DIR` and file uploads to its `files/` directory.

## Docker

The existing Docker deployment keeps using the filesystem fallback. Copy the defaults once into the bind-mounted directory:

```bash
mkdir -p content-data
cp content-defaults/*.json content-data/
docker compose up -d
```

For a container deployment with durable Blob storage, set `BLOB_READ_WRITE_TOKEN` and remove the content/uploads bind mounts.
