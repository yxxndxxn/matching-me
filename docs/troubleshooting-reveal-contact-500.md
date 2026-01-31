# 연락처 공개 API 500 에러 (POST /api/matching/reveal-contact)

## 원인

**500 Internal Server Error**가 연락처 확인하기 버튼 클릭 시 발생하는 경우, 대부분 다음 두 가지입니다.

### 1. view_logs / daily_limits RLS 정책 미적용

`view_logs`에 INSERT 정책이 없거나, `daily_limits`에 INSERT/UPDATE 정책이 없으면 RLS 위반으로 500이 발생합니다.

**해결**: 아래 마이그레이션을 Supabase SQL Editor에서 실행하세요.

```
docs/migrations/20260201_170000_view_logs_rls_insert_v1.sql
```

1. Supabase 대시보드 → SQL Editor
2. `20260201_170000_view_logs_rls_insert_v1.sql` 파일 내용을 복사하여 붙여넣기
3. Run 실행

### 2. Supabase 환경 변수 누락

`.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 없으면 503이 반환됩니다.

**해결**: `.env.local`에 올바른 Supabase URL과 anon key를 설정하세요.

## 적용된 코드 수정 (2026-02-01)

- `getUser()` 안전 처리: `data`가 null일 때 크래시 방지
- RLS 에러 시 명확한 안내 메시지 반환 (마이그레이션 파일 경로 표시)
