// src/routes/home.js
// home_api_service.dart 의 GET /home/dashboard 구현
// HomeDashboardDto: { medications, alarms, completedCount, totalCount }
import { pool } from '../db/pool.js';

export async function homeRoutes(fastify) {
  fastify.get('/home/dashboard', { onRequest: [fastify.authenticate] }, async (req) => {
    const userId = req.user.id;

    const [medsResult, alarmsResult] = await Promise.all([
      pool.query(
        'SELECT id, name, english_name, dose, frequency, time, completed FROM medications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 10',
        [userId]
      ),
      pool.query(
        'SELECT id, date_label, time, type, medicine_name, dose, status FROM alarms WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20',
        [userId]
      ),
    ]);

    const medications = medsResult.rows.map(r => ({
      id: r.id,
      name: r.name,
      englishName: r.english_name,
      dose: r.dose,
      frequency: r.frequency,
      time: r.time,
      completed: r.completed,
    }));

    const alarms = alarmsResult.rows.map(r => ({
      id: r.id,
      dateLabel: r.date_label,
      time: r.time,
      type: r.type,
      medicineName: r.medicine_name,
      dose: r.dose,
      status: r.status,
    }));

    const completedCount = alarms.filter(a => a.status === '복용 완료').length;

    return {
      medications,
      alarms,
      completedCount,
      totalCount: alarms.length,
    };
  });
}
