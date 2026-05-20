// src/routes/settings.js
let demoNotifications = {
  all: true,
  message: true,
  family: true,
  phone: false,
};

export async function settingsRoutes(fastify) {
  fastify.get('/settings/notifications', async () => {
    return demoNotifications;
  });

  fastify.put('/settings/notifications', async (req) => {
    const { all, message, family, phone } = req.body ?? {};
    demoNotifications = {
      all: all ?? true,
      message: message ?? true,
      family: family ?? true,
      phone: phone ?? false,
    };
    return demoNotifications;
  });
}
// updated
