// src/db/migrate.js
// Flutter 코드의 UserProfile, MedicationItem, FamilyMember, ChatMessage 모델 기반
import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
  -- 사용자 (auth_service.dart의 AuthUser 기반)
  CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    password    TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
  );

  -- 복용 약 목록 (link_models.dart의 Medication 기반)
  CREATE TABLE IF NOT EXISTS medications (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    english_name TEXT DEFAULT '',
    dose         TEXT NOT NULL,
    frequency    TEXT NOT NULL,
    time         TEXT NOT NULL,
    completed    BOOLEAN DEFAULT false,
    created_at   TIMESTAMPTZ DEFAULT now()
  );

  -- 복용 알람 (MedicineAlarm 기반)
  CREATE TABLE IF NOT EXISTS alarms (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    medication_id UUID REFERENCES medications(id) ON DELETE SET NULL,
    date_label    TEXT NOT NULL,
    time          TEXT NOT NULL,
    type          TEXT NOT NULL DEFAULT 'alarm',
    medicine_name TEXT NOT NULL,
    dose          TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT '예정',
    created_at    TIMESTAMPTZ DEFAULT now()
  );

  -- 가족 구성원 (FamilyMember 기반)
  CREATE TABLE IF NOT EXISTS family_members (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    relation     TEXT NOT NULL,
    phone        TEXT NOT NULL,
    avatar_text  TEXT DEFAULT '',
    created_at   TIMESTAMPTZ DEFAULT now()
  );

  -- 알림 설정 (NotificationSettingsDto 기반)
  CREATE TABLE IF NOT EXISTS notification_settings (
    user_id  UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    all_on   BOOLEAN DEFAULT true,
    message  BOOLEAN DEFAULT true,
    family   BOOLEAN DEFAULT true,
    phone    BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now()
  );
`;

try {
  await pool.query(sql);
  console.log('마이그레이션 완료');
} catch (err) {
  console.error('마이그레이션 오류:', err.message);
} finally {
  await pool.end();
}
