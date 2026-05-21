// src/routes/family.js
const demoMembers = [
  { id: '1', name: '김건강', relation: '아버지', phone: '010-9876-5432', avatarText: '김' },
];

export async function familyRoutes(fastify) {
  fastify.get('/family/members', async () => {
    return demoMembers;
  });

  fastify.post('/family/members', async (req, reply) => {
    const { name, relation, phone } = req.body ?? {};
    if (!name || !relation || !phone) {
      return reply.status(400).send({ error: '이름, 관계, 전화번호를 입력해주세요.' });
    }
    const newMember = {
      id: String(Date.now()),
      name,
      relation,
      phone,
      avatarText: name[0],
    };
    demoMembers.push(newMember);
    return reply.status(201).send({ item: newMember });
  });

  fastify.delete('/family/members/:id', async (req, reply) => {
    const idx = demoMembers.findIndex(m => m.id === req.params.id);
    if (idx !== -1) demoMembers.splice(idx, 1);
    return reply.status(204).send();
  });
}
