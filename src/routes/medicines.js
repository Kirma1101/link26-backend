// src/routes/medicines.js
export const demoMedicines = [];
export const demoAlarms = [];

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
      name, englishName: '', dose, frequency, time, completed: false,
    };
    demoMedicines.push(item);

    // 알림 자동 생성
    const today = new Date();
    const dateLabel = today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
    const alarm = {
      id: String(Date.now() + 1),
      dateLabel,
      time,
      type: 'medication',
      medicineName: name,
      dose,
      status: '예정',
    };
    demoAlarms.push(alarm);

    return reply.status(201).send({ item });
  });

  fastify.delete('/medicines/:id', async (req, reply) => {
    const idx = demoMedicines.findIndex(m => m.id === req.params.id);
    if (idx !== -1) {
      const med = demoMedicines[idx];
      demoMedicines.splice(idx, 1);
      // 관련 알림도 삭제
      const ai = demoAlarms.findIndex(a => a.medicineName === med.name);
      if (ai !== -1) demoAlarms.splice(ai, 1);
    }
    return reply.status(204).send();
  });
}
