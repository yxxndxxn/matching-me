# 406 Not Acceptable 콘솔 에러

## 원인

**406 Not Acceptable**은 다음 두 가지 경우에 자주 납니다.

### 1. `.single()` 사용 시 행이 0개 또는 2개 이상인 경우 (PostgREST)

Supabase/PostgREST에서 **`.single()`** 은 “정확히 1행”만 허용합니다.  
해당 조건에 맞는 행이 **0개**이거나 **2개 이상**이면 **406**을 반환합니다 (PGRST116).

- **해결**: “0행 또는 1행”이면 **`.maybeSingle()`** 사용.  
  이 프로젝트에서는 `daily_limits` 조회(`getRemainingReveals`, `incrementRevealsUsed`)를 `.maybeSingle()`로 수정해 두었습니다.

### 2. Accept 헤더 불일치

클라이언트가 보내는 **Accept** 헤더와 서버가 줄 수 있는 응답 형식이 맞지 않을 때도 406이 납니다.

- 브라우저·환경이 `Accept`를 생략하거나 `text/html` 등으로 보내는 경우
- Supabase 서버가 JSON만 지원하는데, 그 외 형식을 요청한 것으로 인식하는 경우

## 적용한 수정

Supabase를 쓰는 모든 클라이언트에서, **Supabase URL로 가는 요청**에  
`Accept: application/json` 을 항상 넣도록 커스텀 `fetch`를 사용했습니다.

- **`lib/supabase/client.ts`** – 브라우저(훅·클라이언트 컴포넌트)
- **`lib/supabase/server.ts`** – API 라우트·서버 컴포넌트
- **`lib/supabase/middleware.ts`** – 미들웨어(매 요청 `getUser()`)

이렇게 하면 Auth·REST 요청이 모두 JSON을 요청하는 것으로 가서, 406이 나는 경우가 줄어듭니다.

## 여전히 406이 날 때

1. **개발자도구 → Network** 탭에서 상태 코드 406이 뜨는 **요청 URL**을 확인하세요.
2. **Supabase URL** (`...supabase.co/auth/v1/...` 또는 `.../rest/v1/...`) 이면:
   - 브라우저 확장 프로그램(광고 차단, 프록시 등)이 요청/헤더를 바꾸는지 끄고 다시 시도해 보세요.
   - 다른 네트워크(모바일, 다른 PC)에서도 같은지 확인해 보세요.
3. **다른 URL** (예: `_next/image`, 다른 API) 이면:
   - 406이 나는 **정확한 URL과 요청 방식(GET/POST 등)**을 알려주시면, 그 경로 기준으로 추가로 원인을 짚을 수 있습니다.

## 참고

- [MDN: 406 Not Acceptable](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/406)
- [Supabase Auth 406 이슈](https://github.com/supabase/auth-js/issues/344)
