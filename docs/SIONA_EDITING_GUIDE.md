# Editing the Mezcalomano Site (Guide for Siona)

This guide lets you make and publish changes to mezcalomano.com on your own, without Kimber's involvement.

## How publishing works

Every change you `push` to the `main` branch on GitHub is automatically built and deployed by Vercel. It goes live in about 1-2 minutes. You do not need a Vercel account, and no one has to approve anything.

**Safety net:** if a change breaks the build, Vercel keeps the current live site up, so a broken build cannot go live. To undo a change that did go live, use `git revert` (see Rollback below).

## One-time setup

1. **Accept the GitHub invite.** Kimber adds you as a collaborator; you'll get an email invite. Accept it.
2. **Create a Personal Access Token (PAT)** so Cursor / Claude Code can push:
   - GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.
   - Repository access: only `kimbersykes87-source/Mezcalomano`.
   - Permissions: Contents = Read and write.
   - Copy the token and save it somewhere safe. Use it as your password when git asks.
3. **Clone the repo** in Cursor or Claude Code:
   ```bash
   git clone https://github.com/kimbersykes87-source/Mezcalomano.git
   cd Mezcalomano
   npm install
   ```
4. **Add the local env file.** Kimber will send you the contents of `.env.local`. Create a file named `.env.local` in the project root and paste them in. (This file is intentionally not in GitHub.)

## Making a change

1. Pull the latest first: `git pull`
2. Preview locally: `npm run dev` then open http://localhost:3000
3. Make your edits (see Common edits below).
4. Confirm it still builds: `npm run build`
5. Publish:
   ```bash
   git add -A
   git commit -m "describe what you changed"
   git push
   ```
6. Wait ~1-2 min, then check https://mezcalomano.com.

If you use Claude Code or Cursor's AI, you can just ask it to make the edit, then run steps 4-5. It can do the git commands for you.

## Common edits

- **Text / copy on a page:** pages live in `src/app/`. Each folder is a URL (e.g. `src/app/about/page.tsx` is `/about`).
- **Images:** put files in `public/` and reference them by path (e.g. `/assets/...`).
- **Redirects:** `next.config.ts` (be careful here — see QUICK_REFERENCE.md).

Do not delete: `next.config.ts`, `package.json`, `tsconfig.json`, `src/app/layout.tsx`.

## Rollback (undo a live change)

No dashboard needed:
```bash
git revert HEAD      # undoes the most recent commit
git push
```
This publishes a new deploy that reverses the last change.

## If you get stuck

- Build fails: read the error, or paste it into Claude Code / Cursor and ask for a fix.
- Something needs an environment variable or Vercel dashboard change: that requires Kimber. Note it and wait, or contact him if urgent.

See also: `QUICK_REFERENCE.md` and `CONNECTIONS.md` in the repo root.
