// src/routes/medicines.js
const demoMedicines = [];

export async function medicinesRoutes(fastify) {
  fastify.get('/medicines', async () => {
    return demoMedicines;
  });

  fastify.post('/medicines', async (req, reply) => {
    const { name, dose, frequency, time } = req.body ?? {};
    if (!name || !dose || !frequency || !time) {
      return reply.status(400).send({ error: '이름, 용량, 복용 횟수, 복용 시간을 입력해주세요.' });
    }
    const item = {
      id: String(Date.now()),
      name,
      englishName: '',
      dose,
      frequency,
      time,
      completed: false,
    };
    demoMedicines.push(item);
    return reply.status(201).send({ item });
  });

  fastify.delete('/medicines/:id', async (req, reply) => {
    const idx = demoMedicines.findIndex(m => m.id === req.params.id);
    if (idx !== -1) demoMedicines.splice(idx, 1);
    return reply.status(204).send();
  });
}
