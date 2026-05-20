// src/routes/ai.js
export async function aiRoutes(fastify) {
  fastify.post('/ai/chat', async (req, reply) => {
    const message = req.body?.message ?? '';
    if (!message.trim()) {
      return reply.status(400).send({ error: '메시지를 입력해주세요.' });
    }
    try {
      const response = await fetch(
        https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 당신은 Link26의 AI 건강 도우미입니다. 약 정보, 복약 관리, 건강 상담을 전문으로 합니다. 한국어로 친절하고 정확하게 답변해주세요.\n\n사용자 질문:  }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
          })
        }
      );
      const data = await response.json();
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '죄송합니다. 답변을 생성하지 못했습니다.';
      return { answer };
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'AI 응답 생성 중 오류가 발생했습니다.' });
    }
  });
}
