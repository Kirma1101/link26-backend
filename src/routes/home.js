// src/routes/home.js
// home_api_service.dart 의 GET /home/dashboard 구현
// HomeDashboardDto: { medications, alarms, completedCount, totalCount }
import { pool } from '../db/pool.js';

export async function homeRoutes(fastify) {
  fastify.get('/home/dashboard', async (req) => {
    // 로그인 없이 빈 데이터 반환
    return {
      medications: [],
      alarms: [],
      completedCount: 0,
      totalCount: 0,
    };
  });
}
