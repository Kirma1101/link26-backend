// src/index.js
import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

import { authRoutes } from './routes/auth.js';
import { homeRoutes } from './routes/home.js';
import { medicinesRoutes } from './routes/medicines.js';
import { familyRoutes } from './routes/family.js';
import { settingsRoutes } from './routes/settings.js';
import { aiRoutes } from './routes/ai.js';

const isDev = process.env.NODE_ENV !== 'production';
const fastify = Fastify({
  logger: isDev
    ? { transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss' } } }
    : true,
});

// ── CORS ──────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:8080')
  .split(',')
  .map(o => o.trim());

await fastify.register(cors, {
  origin: (origin, cb) => {
    // Flutter Web 로컬 개발: origin 없거나 허용 목록에 있으면 통과
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS 차단: ' + origin), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// ── JWT ───────────────────────────────────────────
await fastify.register(jwt, {
  secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
});

// authenticate 데코레이터 — 라우트 onRequest 에서 사용
fastify.decorate('authenticate', async (req, reply) => {
  try {
    await req.jwtVerify();
  } catch {
    reply.status(401).send({ error: '인증이 필요합니다. 다시 로그인해주세요.' });
  }
});

// ── 헬스체크 ──────────────────────────────────────
fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// ── 라우트 등록 ───────────────────────────────────
await fastify.register(authRoutes);
await fastify.register(homeRoutes);
await fastify.register(medicinesRoutes);
await fastify.register(familyRoutes);
await fastify.register(settingsRoutes);
await fastify.register(aiRoutes);

// ── 서버 시작 ─────────────────────────────────────
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

try {
  await fastify.listen({ port, host });
  console.log(`Link26 API 서버 실행 중: http://${host}:${port}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
