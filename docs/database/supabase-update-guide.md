# Supabase 스키마 업데이트 가이드

이미 적용된 Supabase DB에 **변경된 부분만** 반영하는 방법을 정리합니다.  
전체 스키마를 다시 실행하지 않고, **증분 마이그레이션(Incremental Migration)** 으로만 업데이트합니다.

---

## 1. 기본 원칙

| 원칙 | 설명 |
|------|------|
| **파괴적 변경 금지** | `DROP TABLE`, `TRUNCATE` 사용하지 않음. 기존 데이터 유지. |
| **증분 업데이트** | `ALTER`, `ADD`, `CREATE INDEX` 등으로 변경분만 적용. |
| **마이그레이션 파일** | 변경 사항은 `docs/database/migrations/` 에 `YYYYMMDD_HHMMSS_설명_vN.sql` 형식으로 저장. |
| **실행 순서** | Supabase SQL Editor에서 마이그레이션 SQL만 복사·실행. |

---

## 2. 업데이트 절차 (공통)

```
1. 로컬에서 변경된 스키마 확인
   → supabase-schema.sql, db-schema.md 등과 비교

2. 증분 마이그레이션 SQL 작성
   → migrations/YYYYMMDD_HHMMSS_변경내용_v1.sql
   → 상단에 변경 사유, 영향도, Rollback 구문 포함

3. Supabase 대시보드에서 실행
   → Project → SQL Editor → New query → 마이그레이션 SQL 붙여넣기 → Run

4. 검증 쿼리로 확인
   → 마이그레이션 파일 하단의 Verification Query 실행

5. 문제 시 Rollback
   → 마이그레이션 파일에 적어 둔 Rollback SQL 실행
```

---

## 3. 현재 반영할 변경분: view_logs 인덱스 (IMMUTABLE)

**변경 사유**  
`view_logs` 의 `idx_view_logs_viewer_date` 인덱스가 `(viewed_at::date)` 를 사용하면  
Supabase/PostgreSQL에서 **"functions in index expression must be marked IMMUTABLE"** 오류가 납니다.  
`timestamptz` → `date` 변환을 **UTC 기준**으로 고정해 IMMUTABLE 하게 수정했습니다.

**적용 시점**  
- 처음 스키마 실행 시 위 인덱스에서 **에러가 나서** `idx_view_logs_viewer_date` 가 없는 경우 → 아래 "Case A"  
- 예전에 `(viewed_at::date)` 로 인덱스를 만들어 둔 경우 → 아래 "Case B"

### Case A: 해당 인덱스가 아직 없는 경우

Supabase SQL Editor에서 아래만 실행하면 됩니다.

```sql
-- view_logs: viewer별 일자별 조회용 인덱스 (IMMUTABLE 표현식)
CREATE INDEX IF NOT EXISTS idx_view_logs_viewer_date
  ON view_logs(viewer_id, ((viewed_at AT TIME ZONE 'UTC')::date));
```

### Case B: 기존 인덱스가 (viewed_at::date) 로 있는 경우

기존 인덱스를 제거한 뒤 새 정의로 만듭니다.

```sql
-- 1. 기존 인덱스 제거
DROP INDEX IF EXISTS idx_view_logs_viewer_date;

-- 2. 새 인덱스 생성 (UTC 기준 날짜)
CREATE INDEX idx_view_logs_viewer_date
  ON view_logs(viewer_id, ((viewed_at AT TIME ZONE 'UTC')::date));
```

### 검증 쿼리

```sql
-- 인덱스 존재 및 정의 확인
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'view_logs'
  AND indexname = 'idx_view_logs_viewer_date';
```

`indexdef` 에 `(viewed_at AT TIME ZONE 'UTC')` 가 포함되어 있으면 적용된 것입니다.

### Rollback (Case B로 적용한 뒤 되돌리기)

```sql
DROP INDEX IF EXISTS idx_view_logs_viewer_date;
CREATE INDEX idx_view_logs_viewer_date
  ON view_logs(viewer_id, (viewed_at::date));
```

※ Rollback 시 `(viewed_at::date)` 인덱스는 Supabase 환경에 따라 다시 IMMUTABLE 오류가 날 수 있으므로,  
문제가 없으면 새 정의(UTC)를 유지하는 것을 권장합니다.

---

## 4. 시드 데이터만 추가/갱신하는 경우

스키마는 그대로 두고 **테스트 데이터만** 넣거나 갱신하려면:

1. Supabase SQL Editor에서 [`seed_data_matching_me.sql`](./seed_data_matching_me.sql) 내용 실행  
2. 실행 전: `auth.users` 에 시드에서 사용하는 UUID 10명이 있어야 함 (파일 상단 주석 참고)  
3. `ON CONFLICT` 로 이미 있는 행은 건너뛰므로, 필요한 블록만 골라서 실행해도 됨  

---

## 5. 앞으로 스키마가 바뀔 때

1. **`supabase-schema.sql`** 를 수정 (신규 테이블/컬럼/인덱스 등 반영)  
2. **증분 마이그레이션** 작성  
   - 파일: `migrations/YYYYMMDD_HHMMSS_변경내용_v1.sql`  
   - 내용: 이미 올라가 있는 Supabase에는 **추가/변경분만** 적용하는 `ALTER`, `CREATE INDEX` 등  
3. **`db-schema.md`** 등 DB 설계 문서를 같은 내용으로 맞춤  
4. Supabase SQL Editor에서 해당 마이그레이션만 실행 후, 검증 쿼리로 확인  

---

## 6. 참고

- **전체 스키마 처음 적용**: [`supabase-schema.sql`](./supabase-schema.sql) 한 번에 실행 (테이블이 없을 때만)  
- **마이그레이션 정책**: [.cursor/rules/700-database-admin-policy.mdc](../../.cursor/rules/700-database-admin-policy.mdc)  
- **테이블 목록/RLS**: [db-schema.md](./db-schema.md)
