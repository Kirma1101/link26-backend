// src/routes/ai.js
// 시연용 — 인증 없이 Gemini API 호출
export async function aiRoutes(fastify) {
  // POST /ai/chat
  fastify.post('/ai/chat', async (req, reply) => {
    const message = req.body?.message ?? '';
    if (!message.trim()) {
      return reply.status(400).send({ error: '메시지를 입력해주세요.' });
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `당신은 Link26의 AI 건강 도우미입니다. 약 정보, 복약 관리, 건강 상담을 전문으로 합니다.
한국어로 친절하고 정확하게 답변해주세요. 의학적 조언은 참고용임을 명시하고, 심각한 증상은 병원 방문을 권고하세요.

사용자 질문: ${message}`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
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

  // POST /ai/prescription
  fastify.post('/ai/prescription', async (req, reply) => {
    const recognizedText = req.body?.recognizedText ?? '';

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `당신은 약사 AI입니다. 아래 처방전 내용을 분석해서 JSON 형식으로만 답변하세요.
응답 형식:
{
  "productName": "주요 약물명",
  "signal": "green 또는 yellow 또는 red",
  "recommendation": "복약 권고사항",
  "reason": "분석 이유"
}
signal 기준: green(안전), yellow(주의 필요), red(위험 가능성)

처방전 내용: ${recognizedText}`
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 500,
            }
          })
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
      const clean = text.replace(/```json|```/g, '').trim();

      try {
        const parsed = JSON.parse(clean);
        return parsed;
      } catch {
        return {
          productName: '분석 완료',
          signal: 'green',
          recommendation: text,
          reason: '처방전을 분석했습니다.',
        };
      }

    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: '처방전 분석 중 오류가 발생했습니다.' });
    }
  });
}
