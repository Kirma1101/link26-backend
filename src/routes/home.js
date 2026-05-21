// src/routes/home.js
import { demoMedicines, demoAlarms } from './medicines.js';

export async function homeRoutes(fastify) {
  fastify.get('/home/dashboard', async () => {
    const completedCount = demoAlarms.filter(a => a.status === '복용 완료').length;
    return {
      medications: demoMedicines,
      alarms: demoAlarms,
      completedCount,
      totalCount: demoAlarms.length,
    };
  });
}
