// src/routes/settings.js
// 시연용 — 인증 없이 메모리 데이터 사용
let demoNotifications = {
  all: true,
  message: true,
  family: true,
  phone: false,
};

export async function settingsRoutes(fastify) {
  // GET /settings/notifications
  fastify.get('/settings/notifications', async () => {
    return demoNotifications;
  });

  // PUT /settings/notifications
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
