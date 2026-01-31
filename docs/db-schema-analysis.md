# Supabase DB 스키마 분석 및 설계

**작성일**: 2026-01-30  
**목적**: 현재 UI/코드와 PRD를 기반으로 실제 서비스 동작에 맞는 최적의 DB 스키마 설계

---

## 1. 코드 분석: UI에서 실제 사용 중인 데이터 필드

### 1.1 데이터 소스

- **`lib/types.ts`**: `UserProfile` 인터페이스 및 `sampleProfiles` (실제 피드/상세에서 사용)
- **`components/domain/feed/candidate-card.tsx`**: 피드 카드에 표시하는 필드
- **`components/domain/profile/profile-detail-view.tsx`**: 프로필 상세 + 연락처 공개
- **`components/domain/feed/feed-list.tsx`**: 필터링/탭 로직
- **`components/domain/feed/filter-bar.tsx`**: 필터 조건

### 1.2 CandidateCard (피드 카드) 사용 필드

| 필드 | 용도 | 비고 |
|------|------|------|
| `id` | 카드/찜/연락처 공개 식별 | 샘플은 number, 실제는 post UUID 권장 |
| `name` | 표시 이름 | |
| `avatarUrl` | 프로필 이미지 | 없으면 placeholder |
| `majorCategory` | 계열 (공학/인문/…) | 라벨 변환 |
| `dormitory` | 동작관/은평관 | 라벨 변환 |
| `grade` | 학년 (1~4학년) | |
| `matchScore` | 매칭률 % | AI 추천 탭 필터(≥80) |
| `chronotype` | 아침형/밤형 | 태그 |
| `sleepingHabit` | 없음/이갈이/코골이 | 태그 |
| `smoking` | 흡연 여부 | 태그 |
| `introduction` | 자기소개 (카드 요약) | line-clamp 2줄 |

### 1.3 ProfileDetailView (상세 + 연락처) 사용 필드

- 위 카드 필드 전부
- **연락처**: `phone`, `kakaoId` (마스킹 후 공개)
- **라이프스타일**: `cleanliness`, `noiseSensitivity` (1~5)
- **dailyRevealsRemaining / maxDailyReveals**: 조회권 (Phase 2, DB는 `daily_limits`)

### 1.4 FeedList 필터/탭

- **필터**: `dormitory`, `gender`, `majorCategory`, `grade`, `smoking`
- **탭**: 전체 매칭 / AI 추천 (`matchScore >= 80`)

### 1.5 온보딩 (PRD + 주석 기준, 현재 폼은 스텁)

- Step 1: 이름, 성별, 소속 관, 계열, 학년
- Step 2: 전화번호, 카카오톡 ID
- Step 3: 생활패턴(chronotype), 잠버릇(sleepingHabit), 흡연(smoking), 청결도(cleanliness), 소음민감도(noiseSensitivity), 자기소개(introduction)

### 1.6 API/쿼리 (현재 스텁이지만 설계 반영)

- **profile**: GET/POST/PUT (프로필 CRUD)
- **matching/generate-summary**: AI 요약 생성 → `matching_posts.ai_summary` 저장
- **matching/reveal-contact**: 연락처 공개 + 조회권 차감 → `view_logs`, `daily_limits` 사용

### 1.7 UI 기준 필드 요약 (스키마에 반영할 항목)

- **프로필(표시/필터/온보딩)**:  
  `name`, `gender`, `major_category`, `grade`, `dormitory`, `phone`, `kakao_id`,  
  `chronotype`, `sleeping_habit`, `smoking`, `cleanliness`, `noise_sensitivity`, `introduction`, `avatar_url`
- **매칭 게시글**:  
  `dormitory`(격리), `ai_summary`, `match_score`, `is_active`
- **찜/연락처 공개**:  
  post 단위 식별 → `bookmarks(post_id)`, `view_logs(viewed_post_id)`, `daily_limits`

---

## 2. PRD와의 병합

- PRD: `profiles`, `matching_posts` + Phase 2에 `view_logs`, `bookmarks`, 조회권
- 코드: 위 1.7과 동일한 필드 세트 + `id`는 피드/찜/조회 단위로 **post id(UUID)** 사용 권장
- **결정**: PRD 구조 유지, 필드명/타입은 **현재 UI와 lib/types.ts**에 맞춤.  
  Supabase는 `auth.users` 사용, **별도 `users` 테이블 없음** (표준 패턴).

---

## 3. 최종 테이블 설계

### 3.1 테이블 목록

| 테이블 | 역할 |
|--------|------|
| **profiles** | 온보딩/프로필 수정 데이터. `id = auth.uid()` |
| **matching_posts** | 매칭 게시글, AI 요약, 점수, 소속관 격리 |
| **view_logs** | 연락처 조회 로그 (Phase 2) |
| **bookmarks** | 찜하기 (Phase 2) |
| **daily_limits** | 일일 조회권 (Phase 2) |

### 3.2 profiles

- **id**: UUID PK, `REFERENCES auth.users(id) ON DELETE CASCADE`
- **name**, **gender** (enum), **major_category** (enum), **grade** (text, 1~4학년), **dormitory** (enum)
- **phone**, **kakao_id** (nullable)
- **chronotype** (enum), **sleeping_habit** (enum), **smoking** (boolean)
- **cleanliness**, **noise_sensitivity** (integer 1~5, nullable)
- **introduction** (text, 500자 제한), **avatar_url** (nullable)
- **created_at**, **updated_at** (timestamptz)

(UI의 camelCase는 앱/API 레이어에서 snake_case로 매핑)

### 3.3 matching_posts

- **id**: UUID PK
- **user_id**: UUID NOT NULL → `auth.users(id)` (작성자)
- **dormitory**: enum (데이터 격리 + 필터)
- **ai_summary**: text nullable
- **match_score**: integer 0~100 nullable
- **is_active**: boolean default true
- **created_at**, **updated_at**

### 3.4 view_logs

- **id**: UUID PK
- **viewer_id**: UUID → auth.users(id)
- **viewed_post_id**: UUID → matching_posts(id)
- **contact_revealed**: boolean default false
- **viewed_at**: timestamptz

### 3.5 bookmarks

- **id**: UUID PK
- **user_id**: UUID → auth.users(id)
- **post_id**: UUID → matching_posts(id)
- **created_at**
- UNIQUE(user_id, post_id)

### 3.6 daily_limits

- **id**: UUID PK
- **user_id**: UUID → auth.users(id)
- **limit_date**: date
- **reveals_used**: integer 0~3 default 0
- **updated_at**
- UNIQUE(user_id, limit_date)

---

## 4. RLS 요약

- **profiles**: 본인만 SELECT/INSERT/UPDATE (id = auth.uid())
- **matching_posts**: 본인 글은 ALL; 타인은 같은 dormitory + is_active=true만 SELECT
- **view_logs**: 본인(viewer_id = auth.uid())만 SELECT; INSERT는 서버/서비스 롤
- **bookmarks**: 본인(user_id = auth.uid())만 ALL
- **daily_limits**: 본인만 SELECT; 갱신은 서버/서비스 롤

---

## 5. 타입 업데이트 방향 (types/)

- **database.ts**: Supabase `Database` 타입 – 위 스키마와 동일한 테이블/컬럼 타입
- **profile.ts**: `Profile` (DB 행), `ProfileInsert`, `ProfileUpdate`
- **matching.ts**: `MatchingPost`, `MatchingPostInsert`, `MatchingPostUpdate`, `FeedItem`(post + profile + match_score 등)
- **api.ts**: 기존 유지 또는 응답 타입만 보강
- **lib/types.ts**: `UserProfile`는 Feed/상세용으로 유지하되, `id`를 `string`(post id) 허용, 필요 시 `userId` 추가

---

## 6. 실행 단계 (승인 후 수행)

다음 순서로 진행하는 것을 권장합니다.

1. **스키마 SQL 작성 및 적용**
   - ENUM 타입 정의
   - `profiles`, `matching_posts`, `view_logs`, `bookmarks`, `daily_limits` CREATE TABLE
   - 인덱스, `updated_at` 트리거
   - RLS 활성화 및 정책 CREATE
   - 파일: `docs/supabase-schema.sql` (Supabase SQL Editor에 붙여넣기용)

2. **기존 db-schema.md 반영**
   - `docs/db-schema.md`를 위 최종 설계와 동일하게 수정 (auth.users 사용, users 테이블 제거 반영)

3. **types/ 최신화**
   - `types/database.ts`: 스키마 기반 `Database` 타입
   - `types/profile.ts`: Profile 계열
   - `types/matching.ts`: MatchingPost, FeedItem 등
   - `types/index.ts`: export 정리
   - `lib/types.ts`: `UserProfile` id 타입 및 필요 시 필드 보강

4. **검증**
   - Supabase 대시보드에서 테이블/RLS 확인
   - 앱에서 기존 화면(피드/상세/필터)이 타입 오류 없이 동작하는지 확인

---

**다음 단계**: 위 **6. 실행 단계**에 대한 승인을 주시면, 1→2→3 순서로 실제 SQL 파일 작성, `db-schema.md` 수정, `types/` 및 `lib/types.ts` 수정까지 진행하겠습니다.
