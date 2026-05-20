// src/routes/family.js
const demoMembers = [];
export async function familyRoutes(fastify) {
  fastify.get('/family/members', async () => demoMembers);
  fastify.post('/family/members', async (req, reply) => {
    const { name, relation, phone } = req.body ?? {};
    if (!name || !relation || !phone) return reply.status(400).send({ error: 'required' });
    const m = { id: String(Date.now()), name, relation, phone, avatarText: name[0] };
    demoMembers.push(m);
    return reply.status(201).send({ item: m });
  });
  fastify.delete('/family/members/:id', async (req, reply) => {
    const idx = demoMembers.findIndex(m => m.id === req.params.id);
    if (idx !== -1) demoMembers.splice(idx, 1);
    return reply.status(204).send();
  });
}
