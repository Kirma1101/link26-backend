// src/routes/settings.js
// notification_api_service.dart 의 GET/PUT /settings/notifications 구현
import { pool } from '../db/pool.js';

export async function settingsRoutes(fastify) {
  // GET /settings/notifications
  fastify.get('/settings/notifications', { onRequest: [fastify.authenticate] }, async (req) => {
    const { rows } = await pool.query(
      'SELECT all_on, message, family, phone FROM notification_settings WHERE user_id=$1',
      [req.user.id]
    );
    if (rows.length === 0) {
      // 기본값 반환
      return { all: true, message: true, family: true, phone: false };
    }
    const r = rows[0];
    return { all: r.all_on, message: r.message, family: r.family, phone: r.phone };
  });

  // PUT /settings/notifications
  fastify.put('/settings/notifications', { onRequest: [fastify.authenticate] }, async (req) => {
    const { all, message, family, phone } = req.body ?? {};

    await pool.query(
      `INSERT INTO notification_settings(user_id, all_on, message, family, phone)
       VALUES($1,$2,$3,$4,$5)
       ON CONFLICT(user_id) DO UPDATE
       SET all_on=$2, message=$3, family=$4, phone=$5, updated_at=now()`,
      [req.user.id, all ?? true, message ?? true, family ?? true, phone ?? false]
    );

    return { all: all ?? true, message: message ?? true, family: family ?? true, phone: phone ?? false };
  });
}
