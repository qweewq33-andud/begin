# PRD: 해외 AI 뉴스 요약 앱

## 1. 개요
해외 AI 뉴스를 RSS로 수집하고, Claude AI가 한국어로 번역·요약·카테고리 분류하여 카드 형태로 보여주는 웹 앱. 마음에 드는 뉴스는 노션에 저장할 수 있다.

## 2. 목표
- 영어 AI 뉴스를 빠르게 훑어볼 수 있도록 한국어 요약 카드 제공
- 카테고리별로 자동 분류하여 원하는 주제만 확인
- 선택한 뉴스를 노션에 간편하게 보관

## 3. 뉴스 소스
| 소스 | RSS URL |
|---|---|
| TechCrunch AI | https://techcrunch.com/category/artificial-intelligence/feed/ |
| The Verge AI | https://www.theverge.com/rss/ai-artificial-intelligence/index.xml |

## 4. 사용자 흐름
1. 앱 실행 시 Clerk 로그인 필수 (미로그인 시 로그인 페이지로 이동)
2. '뉴스 가져오기' 버튼 클릭 → RSS 수집 → 신규 기사만 Claude로 번역·요약·분류 → DB 저장
3. 카테고리별로 분류된 뉴스 카드 표시
4. 카드의 'notion 저장' 버튼 클릭 → 노션에 저장

## 5. 기능 요구사항
### 5.1 로그인
- Clerk 기반 인증, 모든 페이지·API는 로그인 사용자만 접근 가능

### 5.2 뉴스 가져오기
- 버튼 클릭 시에만 수집 (필요할 때마다)
- 피드당 최신 10개 기사 처리
- URL 기준 중복 제외, 이미 저장된 기사는 Claude를 다시 호출하지 않음
- 수집 중 로딩 상태 표시, 실패 시 오류 안내

### 5.3 번역·요약·카테고리 분류
- Claude API 1회 호출로 한국어 제목, 한국어 요약, 카테고리를 JSON으로 반환
- 카테고리는 고정 목록 중에서 선택:
  - 모델·제품 출시
  - 투자·비즈니스
  - 연구·기술
  - 규제·정책
  - 도구·오픈소스
  - 기타

### 5.4 뉴스 카드
- 표시 항목: 한국어 제목, 한국어 요약, 카테고리, 출처, 발행일, 원문 링크
- 카테고리 필터(탭/칩)로 목록 필터링
- 'notion 저장' 버튼 포함, 저장 완료 시 '저장됨' 상태 표시

### 5.5 노션 저장
- Next.js 서버(API Route)가 MCP 클라이언트(@modelcontextprotocol/sdk)로 노션 MCP 서버를 호출해 페이지 생성
- 저장 내용: 제목, 요약, 카테고리, 출처, 원문 링크
- 저장 이력을 DB에 기록하여 중복 저장 방지

## 6. 기술 스택
| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js (App Router) |
| 로그인 | Clerk |
| 데이터베이스 | Neon (PostgreSQL), Drizzle ORM |
| 번역·요약·분류 | Claude API |
| 노션 저장 | 노션 MCP 서버 |

## 7. 데이터 모델
**articles**
- id, url (unique), source, originalTitle, titleKo, summaryKo, category, publishedAt, createdAt

**saved_to_notion**
- userId, articleId, notionPageId, savedAt

## 8. API
| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | /api/news | 저장된 뉴스 목록 (카테고리 필터) |
| POST | /api/news/fetch | RSS 수집 → 중복 제외 → Claude 처리 → DB 저장 |
| POST | /api/notion/save | 선택한 뉴스를 노션에 저장 |

## 9. 디렉토리 구조
```
C:\Begin\
├── drizzle/                         # 마이그레이션 SQL
├── src/
│   ├── middleware.ts                # Clerk 인증
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # 가져오기 버튼 + 카테고리 필터 + 카드 목록
│   │   ├── globals.css
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   └── api/
│   │       ├── news/route.ts
│   │       ├── news/fetch/route.ts
│   │       └── notion/save/route.ts
│   ├── components/
│   │   ├── FetchNewsButton.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── NewsCard.tsx
│   │   ├── NotionSaveButton.tsx
│   │   └── NewsList.tsx
│   ├── lib/
│   │   ├── rss.ts
│   │   ├── claude.ts
│   │   ├── notion-mcp.ts
│   │   ├── categories.ts
│   │   └── feeds.ts
│   └── db/
│       ├── index.ts
│       └── schema.ts
├── drizzle.config.ts
├── .env.local
├── .env.example
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 10. 환경변수
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` (Clerk)
- `DATABASE_URL` (Neon)
- `ANTHROPIC_API_KEY` (Claude)
- 노션 MCP 서버 접속용 토큰 (인증 방식은 구현 단계에서 확정)

## 11. 검증 방법
- 로그인 없이 접근 시 차단되는지 확인
- '뉴스 가져오기'를 연속 2회 실행해도 중복 저장·Claude 재호출이 없는지 확인
- 카테고리가 고정 목록 안에서만 나오는지 확인
- 노션 저장 후 실제 노션 페이지가 생성되는지 확인

## 12. 범위 외 (현재 제외)
- 자동 주기 수집(스케줄러)
- 피드 추가/관리 UI
- 다국어 UI
