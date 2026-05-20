// src/routes/ai.js
export async function aiRoutes(fastify) {
  fastify.post('/ai/chat', async (req, reply) => {
    const message = req.body?.message ?? '';
    if (!message.trim()) {
      return reply.status(400).send({ error: 'message required' });
    }
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Link26 AI 건강 도우미입니다. 한국어로 답변하세요.\n\n질문: ${message}` }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
          })
        }
      );
      const data = await response.json();
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'AI 응답 실패';
      return { answer };
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'AI error' });
    }
  });
}