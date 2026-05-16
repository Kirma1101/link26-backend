// src/routes/medicines.js
// medicine_api_service.dart 의 GET /medicines, POST /medicines, DELETE /medicines/:id 구현
import { pool } from '../db/pool.js';

export async function medicinesRoutes(fastify) {
  // GET /medicines
  fastify.get('/medicines', { onRequest: [fastify.authenticate] }, async (req) => {
    const { rows } = await pool.query(
      'SELECT id, name, english_name, dose, frequency, time, completed, created_at FROM medications WHERE user_id=$1 ORDER BY created_at DESC',
      [req.user.id]
    );
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      englishName: r.english_name,
      dose: r.dose,
      frequency: r.frequency,
      time: r.time,
      completed: r.completed,
    }));
  });

  // POST /medicines
  fastify.post('/medicines', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { name, dose, frequency, time } = req.body ?? {};
    if (!name || !dose || !frequency || !time) {
      return reply.status(400).send({ error: '이름, 용량, 복용 횟수, 복용 시간을 입력해주세요.' });
    }

    const { rows } = await pool.query(
      'INSERT INTO medications(user_id, name, dose, frequency, time) VALUES($1,$2,$3,$4,$5) RETURNING *',
      [req.user.id, name, dose, frequency, time]
    );
    const r = rows[0];
    return reply.status(201).send({
      item: {
        id: r.id,
        name: r.name,
        englishName: r.english_name ?? '',
        dose: r.dose,
        frequency: r.frequency,
        time: r.time,
        completed: r.completed,
      }
    });
  });

  // DELETE /medicines/:id
  fastify.delete('/medicines/:id', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM medications WHERE id=$1 AND user_id=$2',
      [id, req.user.id]
    );
    if (result.rowCount === 0) {
      return reply.status(404).send({ error: '해당 약을 찾을 수 없습니다.' });
    }
    return { ok: true };
  });
}
