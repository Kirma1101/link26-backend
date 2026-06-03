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
import { drugSearchRoutes } from './routes/drug_search.js';

const fastify = Fastify({
  logger: true,
  bodyLimit: 52428800,
});

// CORS 설정
await fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// JWT 설정
await fastify.register(jwt, {
  secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
});

// authenticate 데코레이터 — 인증이 필요한 경우 onRequest 에서 사용
fastify.decorate('authenticate', async (req, reply) => {
  try {
    await req.jwtVerify();
  } catch {
    reply.status(401).send({ error: '인증이 필요합니다. 다시 로그인해주세요.' });
  }
});

// 헬스체크
fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));
fastify.get('/v1/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// 라우트 등록
await fastify.register(authRoutes);
await fastify.register(homeRoutes);
await fastify.register(medicinesRoutes);
await fastify.register(familyRoutes);
await fastify.register(settingsRoutes);
await fastify.register(aiRoutes);
await fastify.register(drugSearchRoutes);

// 서버 시작
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

try {
  await fastify.listen({ port, host });
  console.log(`Link26 API 서버 시작 → http://${host}:${port}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}