// src/routes/family.js
// family_api_service.dart 의 GET /family/members, POST /family/members 구현
import { pool } from '../db/pool.js';

export async function familyRoutes(fastify) {
  // GET /family/members
  fastify.get('/family/members', { onRequest: [fastify.authenticate] }, async (req) => {
    const { rows } = await pool.query(
      'SELECT id, name, relation, phone, avatar_text FROM family_members WHERE user_id=$1 ORDER BY created_at',
      [req.user.id]
    );
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      relation: r.relation,
      phone: r.phone,
      avatarText: r.avatar_text,
    }));
  });

  // POST /family/members
  fastify.post('/family/members', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    const { name, relation, phone } = req.body ?? {};
    if (!name || !relation || !phone) {
      return reply.status(400).send({ error: '이름, 관계, 전화번호를 입력해주세요.' });
    }

    const avatarText = name[0];
    const { rows } = await pool.query(
      'INSERT INTO family_members(user_id, name, relation, phone, avatar_text) VALUES($1,$2,$3,$4,$5) RETURNING *',
      [req.user.id, name, relation, phone, avatarText]
    );
    const r = rows[0];
    return reply.status(201).send({
      item: {
        id: r.id,
        name: r.name,
        relation: r.relation,
        phone: r.phone,
        avatarText: r.avatar_text,
      }
    });
  });
}
