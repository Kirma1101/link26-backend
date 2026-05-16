// src/routes/auth.js
// auth_api_service.dart 의 /auth/login, /auth/signup, /auth/me, /auth/logout 구현
import bcrypt from 'bcrypt';
import { pool } from '../db/pool.js';

export async function authRoutes(fastify) {
  // POST /auth/signup
  fastify.post('/auth/signup', async (req, reply) => {
    const { name, email, password } = req.body ?? {};
    if (!name || !email || !password) {
      return reply.status(400).send({ error: '이름, 이메일, 비밀번호를 모두 입력해주세요.' });
    }
    if (password.length < 6) {
      return reply.status(400).send({ error: '비밀번호는 6자 이상이어야 합니다.' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rows.length > 0) {
      return reply.status(409).send({ error: '이미 사용 중인 이메일입니다.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users(name, email, password) VALUES($1,$2,$3) RETURNING id, name, email',
      [name, email, hashed]
    );
    const user = rows[0];

    // 알림 기본 설정 생성
    await pool.query(
      'INSERT INTO notification_settings(user_id) VALUES($1) ON CONFLICT DO NOTHING',
      [user.id]
    );

    const token = fastify.jwt.sign({ id: user.id, email: user.email }, { expiresIn: '30d' });
    return { accessToken: token, user: { id: user.id, name: user.name, email: user.email } };
  });

  // POST /auth/login
  fastify.post('/auth/login', async (req, reply) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return reply.status(400).send({ error: '이메일과 비밀번호를 입력해주세요.' });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (rows.length === 0) {
      return reply.status(401).send({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return reply.status(401).send({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const token = fastify.jwt.sign({ id: user.id, email: user.email }, { expiresIn: '30d' });
    return { accessToken: token, user: { id: user.id, name: user.name, email: user.email } };
  });

  // GET /auth/me  (인증 필요)
  fastify.get('/auth/me', { onRequest: [fastify.authenticate] }, async (req) => {
    const { rows } = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id=$1',
      [req.user.id]
    );
    if (rows.length === 0) throw fastify.httpErrors.notFound('사용자를 찾을 수 없습니다.');
    return rows[0];
  });

  // POST /auth/logout  (클라이언트 토큰 폐기, 서버에서는 단순 200)
  fastify.post('/auth/logout', { onRequest: [fastify.authenticate] }, async () => {
    return { ok: true };
  });
}
