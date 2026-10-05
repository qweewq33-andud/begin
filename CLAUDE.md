# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Status

Only the `create-next-app` scaffold exists so far. The product spec is `PRD.md` (Korean): an AI-news app that pulls RSS feeds, has Claude translate/summarize/categorize articles into Korean, and saves chosen ones to Notion. Read it before implementing anything; its section 9 defines the target directory layout. The PRD's other dependencies (Clerk, Drizzle, Neon, `@anthropic-ai/sdk`, `@modelcontextprotocol/sdk`, an RSS parser) are not installed yet.

## Commands

```
npm run dev     # dev server
npm run build   # production build
npm run lint    # eslint (flat config, eslint.config.mjs)
npx tsc --noEmit   # typecheck
```

No test runner is configured.

## Stack notes

- Next.js 16 (App Router, `src/` dir, `@/*` → `src/*`), React 19, Tailwind CSS 4 (via `@tailwindcss/postcss`). Next 16 differs from older versions: check `node_modules/next/dist/docs/` first (see AGENTS.md). For example, auth middleware may use a different file convention than the PRD's `src/middleware.ts`.
- `LayoutProps`/route types are generated globally; if `tsc` reports `Cannot find name 'LayoutProps'`, run `npx next typegen`.
- The project folder is `C:\Begin` (capitalized), which is invalid as an npm package name; `package.json` name is `begin`. Don't rerun `create-next-app` in place.
- `npm audit` reports 5 high findings, all dev-only via `eslint-config-next` → `braces`. `--omit=dev` is clean. Do not run `npm audit fix --force` (it downgrades `eslint-config-next` to 14.x).

## Architecture constraints from the PRD

- All pages and API routes require Clerk login (unauthenticated users redirect to the sign-in page).
- Ingestion happens only when the user clicks "뉴스 가져오기" (no scheduler). `POST /api/news/fetch`: fetch the latest 10 items per feed, dedupe by `url` against the DB *before* calling Claude (already-stored articles must never trigger another Claude call), then one Claude call per new article returning JSON `{titleKo, summaryKo, category}`. The UI shows a loading state and an error message on failure.
- Notion saves go through the Next.js server (`POST /api/notion/save`) acting as an MCP client (`@modelcontextprotocol/sdk`) to the Notion MCP server, not the Notion REST SDK. The page contains title, summary, category, source, and original link. A `saved_to_notion` row prevents duplicate saves; the card shows "저장됨" afterward.

### Fixed data

- Feeds (`lib/feeds.ts`): TechCrunch AI `https://techcrunch.com/category/artificial-intelligence/feed/`, The Verge AI `https://www.theverge.com/rss/ai-artificial-intelligence/index.xml`.
- Categories (`lib/categories.ts`), a closed list; Claude output must be validated against it: 모델·제품 출시, 투자·비즈니스, 연구·기술, 규제·정책, 도구·오픈소스, 기타.

### Data model (Drizzle on Neon Postgres)

- `articles`: id, url (unique), source, originalTitle, titleKo, summaryKo, category, publishedAt, createdAt
- `saved_to_notion`: userId, articleId, notionPageId, savedAt

### API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/news` | stored articles, optional category filter |
| POST | `/api/news/fetch` | RSS → dedupe → Claude → DB |
| POST | `/api/notion/save` | save selected article to Notion |

### Environment variables

`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `ANTHROPIC_API_KEY`, plus a Notion MCP access token (auth method not decided yet; the PRD defers it to implementation). Keep `.env.example` in sync with `.env.local`.

### Out of scope

Scheduled auto-fetch, feed add/manage UI, multilingual UI. UI text is Korean.

### Verification checklist (PRD §11)

- Unauthenticated access is blocked.
- Running fetch twice in a row creates no duplicate rows and no repeat Claude calls.
- Categories only ever come from the fixed list.
- A Notion save creates a real Notion page.

The intended file layout is in PRD §9 (`src/db/`, `src/lib/`, `src/components/`, `src/app/api/...`).
