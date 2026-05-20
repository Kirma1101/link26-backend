// src/routes/settings.js
let demo = { all: true, message: true, family: true, phone: false };
export async function settingsRoutes(fastify) {
  fastify.get('/settings/notifications', async () => demo);
  fastify.put('/settings/notifications', async (req) => {
    const { all, message, family, phone } = req.body ?? {};
    demo = { all: all ?? true, message: message ?? true, family: family ?? true, phone: phone ?? false };
    return demo;
  });
}
