// src/routes/ai.js
export async function aiRoutes(fastify) {
  // 일반 채팅
  fastify.post('/ai/chat', async (req, reply) => {
    const message = req.body?.message ?? '';
    if (!message.trim()) return reply.status(400).send({ error: 'message required' });
    try {
      const model = process.env.GEMINI_MODEL_ID || 'gemini-2.5-flash';
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + process.env.GEMINI_API_KEY,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Link26 AI 건강 도우미입니다. 한국어로 친절하게 답변하세요.\n\n질문: ' + message }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
          })
        }
      );
      const data = await res.json();
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const finishReason = data.candidates?.[0]?.finishReason;
      fastify.log.info('Gemini finishReason: ' + finishReason);
      if (!answer) {
        fastify.log.error('Gemini no answer: ' + JSON.stringify(data));
        return { answer: '잠시 후 다시 시도해주세요.' };
      }
      return { answer };
    } catch (err) {
      fastify.log.error(err.message);
      return reply.status(500).send({ error: 'AI error' });
    }
  });

  // 처방전 이미지 분석 (Gemini Vision)
  fastify.post('/ai/prescription-image', async (req, reply) => {
    const { imageBase64, mimeType } = req.body ?? {};
    if (!imageBase64) return reply.status(400).send({ error: '이미지가 없습니다.' });
    try {
      const model = process.env.GEMINI_MODEL_ID || 'gemini-2.5-flash';
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + process.env.GEMINI_API_KEY,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBase64 } },
                { text: '이 처방전 또는 약 이미지를 분석해주세요. 다음 내용을 한국어로 설명해주세요:\n1. 처방된 약 이름들\n2. 각 약의 효능과 용도\n3. 복용 방법 및 주의사항\n4. 약물 상호작용 주의사항\n처방전이 아닌 경우에도 약과 관련된 정보라면 최대한 분석해주세요.' }
              ]
            }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 4096 }
          })
        }
      );
      const data = await res.json();
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!answer) return { answer: '이미지를 분석할 수 없습니다. 다시 시도해주세요.' };
      return { answer };
    } catch (err) {
      fastify.log.error(err.message);
      return reply.status(500).send({ error: '이미지 분석 중 오류가 발생했습니다.' });
    }
  });

  // 처방전 텍스트 분석
  fastify.post('/ai/prescription', async (req, reply) => {
    const recognizedText = req.body?.recognizedText ?? '';
    try {
      const model = process.env.GEMINI_MODEL_ID || 'gemini-2.5-flash';
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + process.env.GEMINI_API_KEY,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: '처방전 분석: ' + recognizedText + '\n\nJSON으로만 응답하세요: {"productName":"약이름","signal":"green또는yellow또는red","recommendation":"권고사항","reason":"이유"}' }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 512 }
          })
        }
      );
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
      const clean = text.replace(/```json|```/g, '').trim();
      try { return JSON.parse(clean); }
      catch { return { productName: '분석 완료', signal: 'green', recommendation: text, reason: '' }; }
    } catch (err) {
      return reply.status(500).send({ error: 'AI error' });
    }
  });
}
