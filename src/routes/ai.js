// src/routes/ai.js
export async function aiRoutes(fastify) {
  fastify.post('/ai/chat', async (req, reply) => {
    const message = req.body?.message ?? '';
    if (!message.trim()) return reply.status(400).send({ error: 'message required' });
    try {
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + process.env.GEMINI_API_KEY,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'Link26 AI. Answer in Korean. Question: ' + message }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 1000 } }) }
      );
      const data = await res.json();
      fastify.log.info('Gemini response: ' + JSON.stringify(data));
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'AI error';
      return { answer };
    } catch (err) {
      fastify.log.error('Gemini error: ' + err.message);
      return reply.status(500).send({ error: 'AI error' });
    }
  });
}
