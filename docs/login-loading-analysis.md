# 로그인 로딩 지연 원인 분석 및 코드 정리

## 1. 로딩이 오래 걸리는 구간 (원인)

### A. 버튼 클릭 → Google 로그인 페이지로 넘어가기 전 (클라이언트)

| 순서 | 동작 | 비고 |
|------|------|------|
| 1 | `setIsLoggingIn(true)` | React 상태 업데이트 (동기) |
| 2 | **바로** `createClient()` 호출 | Supabase 브라우저 클라이언트 생성 |
| 3 | **바로** `signInWithOAuth()` **await** | **여기서 지연 가능** |

**지연 원인:**

- **React 페인트 타이밍**: `setIsLoggingIn(true)` 직후 같은 함수에서 곧바로 `await signInWithOAuth()`를 호출하면, 브라우저가 “로딩 화면”을 그리기 전에 메인 스레드가 네트워크 대기로 묶인다. 그래서 “버튼만 누르고 한동안 반응 없음”처럼 보일 수 있다.
- **`signInWithOAuth()` 자체**: Supabase Auth 서버에 요청해 OAuth URL을 받아오는 **네트워크 왕복**이 한 번 발생한다. 네트워크/서버가 느리면 이 구간이 길어진다.
- **매번 `createClient()`**: 클릭할 때마다 새 Supabase 클라이언트를 만든다. 생성 비용은 작지만, 불필요한 반복이다.

### B. Google 로그인 후 콜백 (`/api/auth/callback`) (서버)

| 순서 | 동작 | 비고 |
|------|------|------|
| 1 | `createClient()` (서버) | 쿠키 읽기 + 서버 클라이언트 생성 |
| 2 | `exchangeCodeForSession(code)` | **Supabase와 토큰 교환 (네트워크)** |
| 3 | `getUser()` | 보통 메모리 세션 사용 |
| 4 | `hasProfile(supabase, user.id)` | **DB 조회 1회** |

**지연 원인:**

- `exchangeCodeForSession`: Supabase 서버와의 통신이라 외부 지연 가능.
- `hasProfile`: `profiles` 테이블에 `id`로 조회. `id`가 PK면 보통 빠르지만, DB/네트워크가 느리면 체감될 수 있다.

---

## 2. 엉킨/불필요한 코드

### 2.1 사용되지 않는 컴포넌트

- **`components/login-screen.tsx`**  
  - “Google로 계속하기” 버튼과 `onLogin` 콜백만 있는 UI 컴포넌트.
  - 실제 로그인 진입점은 **`app/(auth)/login/page.tsx`** 뿐이며, 여기서는 이 컴포넌트를 **import하지 않음**.
  - 문서/다이어그램에서만 이름이 등장 → **현재 앱에서는 미사용(데드 코드)**.  
  - 정리: 삭제하거나, 나중에 재사용할 계획이 있으면 “미사용” 주석을 달아두는 것을 권장.

### 2.2 중복/유사 코드

- **Google 로고 SVG**  
  - `login-screen.tsx`와 `(auth)/login/page.tsx`에 각각 비슷한 Google 로고 SVG가 있음.
  - 현재 로그인 페이지는 `(auth)/login/page.tsx`만 사용하므로, 실질적으로 한 곳에만 있음.  
  - `login-screen.tsx`를 제거하면 중복도 함께 사라짐.

### 2.3 로그인 페이지 구조

- **Suspense + useSearchParams**  
  - `LoginContent`가 `useSearchParams()`를 쓰기 때문에 `Suspense`로 감싸야 함.  
  - 필요 구조이며, fallback은 단순 스피너로 유지해도 됨.

- **에러/메시지 처리**  
  - `useEffect`에서 `error`, `message` 쿼리만 보고 toast 호출.  
  - 역할이 분리되어 있어 엉킨 부분은 없음.

---

## 3. 개선 권장 사항

1. **로딩 화면을 먼저 그리기**  
   - 버튼 클릭 시 `setIsLoggingIn(true)`만 먼저 하고, **한 틱 뒤에** OAuth 호출을 실행한다.  
   - 예: `setTimeout(..., 0)` 또는 `queueMicrotask`로 `handleGoogleLogin` 내부의 `createClient()` + `signInWithOAuth()` 호출을 감싼다.  
   - 효과: “클릭했는데 반응이 없다”는 체감을 줄일 수 있음.

2. **Supabase 클라이언트 재사용 (선택)**  
   - 브라우저에서 `createClient()`를 한 번만 만들어 모듈 단일 인스턴스로 두고, 로그인 시에도 그 인스턴스를 쓰면, 클릭마다 생성하는 오버헤드를 줄일 수 있음.  
   - Supabase 쪽 문서/권장사항과 맞는지 확인 후 적용 권장.

3. **콜백 구간**  
   - `exchangeCodeForSession`과 `hasProfile`은 로그인 플로우에 필수이므로 제거하기 어렵고, 지연은 네트워크/DB 성능 이슈일 가능성이 크다.  
   - 필요하면 콜백 라우트에 로깅/메트릭을 넣어 어느 단계가 느린지 측정하는 것을 권장.

4. **미사용 코드**  
   - `components/login-screen.tsx`는 사용처가 없으므로 삭제하거나, “현재 미사용”으로 표시해 두는 것을 권장.

---

## 4. 적용한 수정 (코드)

- **로그인 페이지** `app/(auth)/login/page.tsx`: 버튼 클릭 시 `setIsLoggingIn(true)`만 먼저 수행하고, **`setTimeout(..., 0)`** 으로 OAuth 호출을 다음 태스크로 미룸. 로딩 화면이 최소 한 번 그려진 뒤 `signInWithOAuth`가 실행되도록 함.
- **Supabase 브라우저 클라이언트** `lib/supabase/client.ts`: **싱글톤**으로 변경. 버튼 클릭마다 새 클라이언트를 만들지 않아 체감 지연 완화.
- **로그인 페이지** `app/(auth)/login/page.tsx`: 로그인 페이지 마운트 시 Supabase origin에 **`<link rel="preconnect">`** 추가. 첫 클릭 시 TCP/TLS 연결을 미리 맺어 지연 완화.

## 5. 요약

| 구간 | 원인 | 조치 |
|------|------|------|
| 버튼 클릭 후 반응 없음 | 로딩 UI가 그려지기 전에 OAuth await로 메인 스레드 점유 | 로딩 상태 설정 후 한 틱 뒤에 OAuth 호출 |
| Google 이동까지 느림 | `signInWithOAuth()`의 Supabase Auth 네트워크 요청 | 서버/네트워크 환경 점검, 클라이언트 재사용 등으로 간접 완화 |
| Google 로그인 후 앱으로 돌아올 때 느림 | `exchangeCodeForSession` + `hasProfile` | 필수 단계; 필요 시 단계별 측정 후 최적화 |

불필요/엉킨 코드: **`components/login-screen.tsx`** 는 현재 미사용이므로 정리 대상.

---

## 6. 여전히 느릴 때: 어디서 시간이 쓰이는지 측정하기

버튼 클릭 후 "Google로 이동하고 있어요..." 화면이 오래 보인다면, **지연이 `signInWithOAuth()` 네트워크 구간**인지 확인하려면 아래처럼 구간별 시간을 찍어보면 된다.

`app/(auth)/login/page.tsx`의 `handleGoogleLogin` 내부 `setTimeout` 콜백에서:

```ts
setTimeout(async () => {
  const t0 = performance.now();
  try {
    const t1 = performance.now();
    const supabase = createClient();
    const t2 = performance.now();
    const { error } = await supabase.auth.signInWithOAuth({ ... });
    const t3 = performance.now();
    if (import.meta.env?.DEV || process.env.NODE_ENV === "development") {
      console.log("[Login timing] createClient:", t2 - t1, "ms, signInWithOAuth:", t3 - t2, "ms");
    }
    // ...
  } catch (e) { ... }
}, 0);
```

- **createClient** 구간이 크면: 싱글톤/캐시가 제대로 적용됐는지 확인.
- **signInWithOAuth** 구간이 크면: Supabase 서버/네트워크(지역, 방화벽, DNS 등) 또는 Google OAuth 설정 쪽을 점검.
