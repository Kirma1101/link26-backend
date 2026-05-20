// src/routes/ai.js
export async function aiRoutes(fastify) {
  fastify.post('/ai/chat', async (req, reply) => {
    const message = req.body?.message ?? '';
    if (!message.trim()) return reply.status(400).send({ error: 'message required' });
    try {
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite-preview-06-17:generateContent?key=' + process.env.GEMINI_API_KEY,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'Link26 AI 건강 도우미입니다. 한국어로 친절하게 답변하세요.\n\n질문: ' + message }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 1000 } }) }
      );
      const data = await res.json();
      fastify.log.info('Gemini: ' + JSON.stringify(data).slice(0, 200));
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '잠시 후 다시 시도해주세요.';
      return { answer };
    } catch (err) {
      fastify.log.error(err.message);
      return reply.status(500).send({ error: 'AI error' });
    }
  });
}
