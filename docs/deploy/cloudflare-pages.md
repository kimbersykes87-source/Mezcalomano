# Cloudflare Pages Deployment

This document describes how to deploy the Mezcalómano website to Cloudflare Pages.

## Build Configuration

| Setting | Value |
|---------|-------|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | 22 (or 20 LTS) |

## Environment Variables

No environment variables are required for the basic build.

For production, you may want to set:
- `TURNSTILE_SITE_KEY` - Cloudflare Turnstile site key for the contact form

## Node Version Selection

Cloudflare Pages uses Node 22 by default. This project is compatible with both Node 20 LTS and Node 22.

To pin a specific version in Cloudflare Pages:
1. Go to your project settings
2. Under "Environment variables"
3. Add `NODE_VERSION` with value `22` (or `20`)

Alternatively, the `.nvmrc` and `.node-version` files in the repository root will be respected.

## Common Build Issues

### Sharp Image Service Warning

You may see this warning:
```
The currently selected adapter `@astrojs/cloudflare` is not compatible with the image service "Sharp".
```

This is expected. Cloudflare Workers don't support Sharp, so Astro will use a compatible image service automatically. The warning does not prevent the build from succeeding.

### API Route GET Method Warning

```
No API Route handler exists for the method "GET" for the route "/api/contact".
```

This is expected. The contact API only handles POST requests. GET requests will return a 405 Method Not Allowed.

## Deployment Workflow

1. Push to the `main` branch
2. Cloudflare Pages will automatically trigger a build
3. Preview deployments are created for pull requests

## Manual Deployment

To deploy manually using Wrangler:

```bash
npm run build
npx wrangler pages deploy dist
```

## Rollback

To rollback to a previous deployment:
1. Go to the Cloudflare Pages dashboard
2. Select the deployment to rollback to
3. Click "Rollback to this deployment"
