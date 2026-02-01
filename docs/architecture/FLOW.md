# 매칭미? (Matching Me?) - Mermaid Diagrams

## 1. 사용자 여정 및 로직 흐름 (Sequence Diagram)

```mermaid
sequenceDiagram
    actor User as 사용자
    participant Login as 로그인 화면
    participant Auth as Google OAuth
    participant Onboarding as 온보딩
    participant Main as 메인 피드
    participant AI as AI 매칭 시스템
    participant DB as Supabase DB
    participant Detail as 프로필 상세

    %% 로그인 플로우
    User->>Login: 앱 접속
    Login->>Auth: Google 소셜 로그인
    Auth-->>Login: 인증 토큰 반환
    Login->>Onboarding: 온보딩으로 이동

    %% 온보딩 플로우 (3단계)
    Note over Onboarding: Step 1: 기본 정보
    User->>Onboarding: 이름, 성별, 계열, 학년, 소속관 입력
    Note over Onboarding: Step 2: 연락처
    User->>Onboarding: 기타 연락처, 카카오톡 ID 입력
    Note over Onboarding: Step 3: 라이프스타일
    User->>Onboarding: 생활패턴, 잠버릇, 흡연여부,<br/>청결도, 소음민감도, 자기소개 입력

    Onboarding->>DB: 프로필 데이터 저장 (profiles, matching_posts)
    DB-->>Onboarding: 저장 완료
    Onboarding->>Main: 메인 피드로 이동

    %% 메인 피드 플로우
    Main->>DB: 소속관 기반 프로필 조회 (데이터 격리)
    DB-->>Main: 필터링된 프로필 목록 반환

    Main->>AI: 각 프로필에 대해 AI 매칭 요약 요청
    Note over AI: 사용자 패턴 vs 상대방 패턴 비교
    AI-->>Main: "우리는 이런 점이 잘 맞아요" 텍스트 생성

    Main->>User: 매칭 카드 피드 표시<br/>(AI 요약 + 핵심 태그)

    %% 필터링 및 탭 전환
    User->>Main: 필터 적용 (관, 성별, 계열, 학년, 흡연여부)
    Main->>DB: 필터링된 데이터 재조회
    DB-->>Main: 필터링 결과 반환

    User->>Main: 탭 전환 (전체 매칭 / AI 추천)
    Note over Main: AI 추천 탭: matchScore >= 80인 프로필만 표시

    %% 프로필 상세 및 연락처 조회
    User->>Main: 특정 카드 클릭
    Main->>Detail: 프로필 상세 화면 이동
    Detail->>User: 라이프 패턴 상세 정보 표시

    User->>Detail: "연락처 확인" 버튼 클릭

    alt 조회권 남아있음 (dailyRevealsRemaining > 0)
        Detail->>DB: 연락처 조회 로그 저장
        Detail->>Detail: 조회권 차감 (3 → 2)
        Detail->>User: 기타 연락처, 카카오톡 ID 공개
    else 조회권 소진
        Detail->>User: "오늘의 조회 한도를 초과했습니다" 알림
    end

    %% 찜하기 기능
    User->>Detail: 찜하기 클릭
    Detail->>Main: savedProfiles 상태 업데이트

    %% 마이페이지
    User->>Main: 마이페이지 탭 클릭
    Main->>User: 내 프로필 정보, 찜한 목록,<br/>연락처 공개 횟수 (N/3) 표시
```

---

## 2. 서비스 아키텍처 및 페이지 구조 (Flowchart)

```mermaid
flowchart TD
    Start([사용자 앱 접속]) --> LoginCheck{로그인<br/>상태?}

    LoginCheck -->|미로그인| LoginScreen[로그인 화면<br/>LoginScreen.tsx]
    LoginCheck -->|로그인 완료| ProfileCheck{프로필<br/>등록 완료?}

    LoginScreen --> GoogleAuth[Google OAuth 인증]
    GoogleAuth --> ProfileCheck

    ProfileCheck -->|미완료| Onboarding[온보딩 화면<br/>Onboarding.tsx]
    ProfileCheck -->|완료| MainApp[메인 앱<br/>page.tsx]

    Onboarding --> OnboardingStep1[Step 1: 기본 정보<br/>이름, 성별, 계열, 학년, 소속관]
    OnboardingStep1 --> OnboardingStep2[Step 2: 연락처<br/>기타 연락처, 카카오톡 ID]
    OnboardingStep2 --> OnboardingStep3[Step 3: 라이프스타일<br/>생활패턴, 잠버릇, 흡연여부,<br/>청결도, 소음민감도, 자기소개]
    OnboardingStep3 --> SaveProfile[(Supabase DB<br/>프로필 저장)]
    SaveProfile --> MainApp

    MainApp --> TabSelection{선택한 탭}

    TabSelection -->|홈 탭| HomeView[룸메찾기 화면<br/>HomeView.tsx]
    TabSelection -->|프로필 탭| ProfileView[마이페이지<br/>ProfileView.tsx]

    %% HomeView 플로우
    HomeView --> FilterBar[필터바<br/>FilterBar.tsx<br/>관/성별/계열/학년/흡연여부]
    FilterBar --> TabMenu{탭 메뉴}

    TabMenu -->|전체 매칭| AllMatching[전체 매칭 피드]
    TabMenu -->|AI 추천| AIMatching[AI 추천 피드<br/>matchScore >= 80]

    AllMatching --> LoadProfiles[(DB에서<br/>소속관 기반 필터링)]
    AIMatching --> LoadProfiles

    LoadProfiles --> GenerateAISummary[AI 매칭 요약 생성<br/>각 프로필마다 실행]
    GenerateAISummary --> CandidateCards[매칭 카드 목록<br/>CandidateCard.tsx]

    CandidateCards --> CardAction{사용자 액션}

    CardAction -->|카드 클릭| ProfileDetail[프로필 상세<br/>ProfileDetailView.tsx]
    CardAction -->|찜하기 클릭| SaveToList[(찜 목록 저장<br/>savedProfiles)]

    ProfileDetail --> ContactReveal{연락처 확인<br/>버튼 클릭?}

    ContactReveal -->|예| CheckLimit{조회권<br/>남았나?<br/>N/3}
    ContactReveal -->|아니오| BackToFeed[피드로 돌아가기]

    CheckLimit -->|예| RevealContact[연락처 공개<br/>- 기타 연락처<br/>- 카카오톡 ID]
    CheckLimit -->|아니오| ShowError[조회 한도 초과<br/>알림 표시]

    RevealContact --> DecrementLimit[(조회권 차감<br/>로그 저장)]
    DecrementLimit --> BackToFeed
    ShowError --> BackToFeed

    BackToFeed --> CandidateCards

    %% ProfileView 플로우
    ProfileView --> MyProfile[내 프로필 정보<br/>ProfileCard.tsx]
    ProfileView --> SavedList[찜한 룸메이트 목록<br/>MatchCard.tsx]
    ProfileView --> EditProfile[프로필 수정]
    ProfileView --> LogoutBtn[로그아웃]

    LogoutBtn --> LoginScreen

    %% 데이터 레이어
    LoadProfiles --> Supabase[(Supabase<br/>Database)]
    SaveProfile --> Supabase
    DecrementLimit --> Supabase
    SaveToList --> LocalState[(로컬 상태<br/>React State)]

    %% 스타일링
    classDef screen fill:#e1f5ff,stroke:#0066cc,stroke-width:2px
    classDef component fill:#fff4e6,stroke:#ff9800,stroke-width:2px
    classDef database fill:#e8f5e9,stroke:#4caf50,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#ff6f00,stroke-width:2px

    class LoginScreen,Onboarding,MainApp,HomeView,ProfileView,ProfileDetail screen
    class FilterBar,TabMenu,CandidateCards,MyProfile,SavedList component
    class Supabase,SaveProfile,LoadProfiles,DecrementLimit database
    class LoginCheck,ProfileCheck,TabSelection,TabMenu,CardAction,ContactReveal,CheckLimit decision
```

---

## 3. 데이터 관계도 (ERD - Entity Relationship Diagram)

```mermaid
erDiagram
    USERS ||--|| PROFILES : has
    USERS ||--o{ MATCHING_POSTS : creates
    USERS ||--o{ VIEW_LOGS : generates
    USERS ||--o{ BOOKMARKS : saves
    MATCHING_POSTS ||--o{ VIEW_LOGS : receives
    MATCHING_POSTS ||--o{ BOOKMARKS : has

    USERS {
        uuid id PK "Google OAuth ID"
        string email UK "이메일"
        string google_id UK "Google 고유 ID"
        timestamp created_at "가입일"
        timestamp last_login "마지막 로그인"
    }

    PROFILES {
        uuid id PK "users.id FK"
        string name "성명"
        enum gender "성별 (male/female)"
        enum major_category "계열 (engineering/humanities/social/natural/arts/education)"
        string grade "학년 (1학년~4학년)"
        enum dormitory "소속관 (dongjak/eunpyeong)"
        string other_contact "기타 연락처"
        string contact "연락처"
        enum chronotype "생활패턴 (morning/night)"
        enum sleeping_habit "잠버릇 (none/grinding/snoring)"
        boolean smoking "흡연여부"
        integer cleanliness "청결도 (1-5)"
        integer noise_sensitivity "소음민감도 (1-5)"
        text introduction "자기소개 (최대 500자)"
        string avatar_url "프로필 이미지 URL"
        timestamp created_at "프로필 생성일"
        timestamp updated_at "프로필 수정일"
    }

    MATCHING_POSTS {
        uuid id PK "게시글 ID"
        uuid user_id FK "작성자 ID (users.id)"
        enum dormitory "소속관 (데이터 격리용)"
        text ai_summary "AI 생성 매칭 포인트 요약"
        integer match_score "매칭 점수 (0-100)"
        boolean is_active "활성 상태 (매칭 완료시 false)"
        timestamp created_at "게시일"
        timestamp updated_at "수정일"
    }

    VIEW_LOGS {
        uuid id PK "조회 로그 ID"
        uuid viewer_id FK "조회한 사용자 (users.id)"
        uuid viewed_post_id FK "조회된 게시글 (matching_posts.id)"
        boolean contact_revealed "연락처 공개 여부"
        timestamp viewed_at "조회 시간"
    }

    BOOKMARKS {
        uuid id PK "찜하기 ID"
        uuid user_id FK "찜한 사용자 (users.id)"
        uuid post_id FK "찜한 게시글 (matching_posts.id)"
        timestamp created_at "찜한 날짜"
    }

    DAILY_LIMITS {
        uuid id PK "제한 ID"
        uuid user_id FK "사용자 ID (users.id)"
        date limit_date "제한 적용 날짜"
        integer reveals_used "당일 사용한 조회권 (최대 3)"
        integer reveals_remaining "남은 조회권"
        timestamp updated_at "마지막 업데이트"
    }

    USERS ||--o{ DAILY_LIMITS : tracks
```

---

## 데이터 모델 설명

### 핵심 데이터 흐름

1. **사용자 등록 및 프로필 생성**
   - `USERS` 테이블: Google OAuth를 통한 인증 정보 저장
   - `PROFILES` 테이블: 온보딩 3단계에서 수집한 모든 개인정보 저장
   - `MATCHING_POSTS` 테이블: AI 요약과 함께 매칭용 게시글 생성

2. **데이터 격리 (Dormitory-based Filtering)**
   - `MATCHING_POSTS.dormitory` 필드로 동작관/은평관 분리
   - 사용자는 자신의 소속관 데이터만 조회 가능

3. **조회권 시스템 (Phase 2)**
   - `DAILY_LIMITS` 테이블: 일일 연락처 조회 횟수 추적 (최대 3회)
   - `VIEW_LOGS` 테이블: 모든 조회 기록 저장 (감사 로그)

4. **찜하기 기능**
   - `BOOKMARKS` 테이블: 나중에 연락하고 싶은 프로필 저장
   - 마이페이지에서 찜한 목록 확인 가능

---

## Phase 1 (MVP) vs Phase 2 (고도화) 차이점

### Phase 1 구현 범위

- ✅ Google 소셜 로그인
- ✅ 3단계 온보딩
- ✅ 소속관 기반 데이터 격리
- ✅ AI 매칭 요약 카드 피드
- ✅ 프로필 상세 조회
- ✅ 연락처 즉시 공개

### Phase 2 추가 기능

- 🔲 조회권 시스템 (`DAILY_LIMITS`, `VIEW_LOGS`)
- 🔲 매칭 완료 상태 관리 (`is_active` 플래그)
- 🔲 상세 필터링 (잠버릇, 청결도 등 복합 조건)
- 🔲 찜하기 (`BOOKMARKS`)
- 🔲 이미지 업로드 (Supabase Storage)
- 🔲 스켈레톤 UI 로딩
- 🔲 개인정보 마스킹 (조회권 사용 전)

---

## 기술 스택 매핑

| Layer          | Technology                                                 |
| -------------- | ---------------------------------------------------------- |
| Frontend       | Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion |
| UI Components  | shadcn/ui, Lucide Icons                                    |
| Backend        | Supabase (PostgreSQL)                                      |
| Authentication | Google OAuth 2.0                                           |
| AI             | OpenAI API (매칭 요약 생성)                                |
| Hosting        | Vercel                                                     |
