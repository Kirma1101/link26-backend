// src/routes/home.js
import { demoMedicines } from './medicines.js';

export async function homeRoutes(fastify) {
  fastify.get('/home/dashboard', async () => {
    return {
      medications: demoMedicines,
      alarms: [],
      completedCount: 0,
      totalCount: demoMedicines.length,
    };
  });
}
