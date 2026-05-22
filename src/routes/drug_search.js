// src/routes/drug_search.js
// 식품의약품안전처_의약품개요정보(e약은요) API 연동

export async function drugSearchRoutes(fastify) {
  // GET /drug/search?q=약이름
  fastify.get('/drug/search', async (req, reply) => {
    const query = req.query.q ?? '';
    if (!query.trim()) {
      return reply.status(400).send({ error: '검색어를 입력해주세요.' });
    }

    const serviceKey = process.env.PUBLIC_DATA_SERVICE_KEY;
    if (!serviceKey) {
      return reply.status(500).send({ error: 'API 키가 설정되지 않았습니다.' });
    }

    try {
      const url = new URL('http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList');
      url.searchParams.set('serviceKey', serviceKey);
      url.searchParams.set('itemName', query);
      url.searchParams.set('type', 'json');
      url.searchParams.set('numOfRows', '10');
      url.searchParams.set('pageNo', '1');

      const res = await fetch(url.toString(), { timeout: 10000 });
      const data = await res.json();

      const items = data?.body?.items ?? [];
      const results = items.map(item => ({
        id: item.itemSeq,
        name: item.itemName,
        company: item.entpName,
        effect: item.efcyQesitm,
        usage: item.useMethodQesitm,
        caution: item.atpnQesitm,
        interaction: item.intrcQesitm,
        sideEffect: item.seQesitm,
        storage: item.depositMethodQesitm,
        image: item.itemImage,
      }));

      return { results };
    } catch (err) {
      fastify.log.error('Drug search error: ' + err.message);
      return reply.status(500).send({ error: '약 검색 중 오류가 발생했습니다.' });
    }
  });

  // GET /drug/detail?name=약이름 (단일 약 상세정보)
  fastify.get('/drug/detail', async (req, reply) => {
    const name = req.query.name ?? '';
    if (!name.trim()) {
      return reply.status(400).send({ error: '약 이름을 입력해주세요.' });
    }

    const serviceKey = process.env.PUBLIC_DATA_SERVICE_KEY;

    try {
      const url = new URL('http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList');
      url.searchParams.set('serviceKey', serviceKey);
      url.searchParams.set('itemName', name);
      url.searchParams.set('type', 'json');
      url.searchParams.set('numOfRows', '1');
      url.searchParams.set('pageNo', '1');

      const res = await fetch(url.toString());
      const data = await res.json();

      const item = data?.body?.items?.[0];
      if (!item) return reply.status(404).send({ error: '약 정보를 찾을 수 없습니다.' });

      return {
        id: item.itemSeq,
        name: item.itemName,
        company: item.entpName,
        effect: item.efcyQesitm,
        usage: item.useMethodQesitm,
        caution: item.atpnQesitm,
        interaction: item.intrcQesitm,
        sideEffect: item.seQesitm,
        storage: item.depositMethodQesitm,
        image: item.itemImage,
      };
    } catch (err) {
      fastify.log.error('Drug detail error: ' + err.message);
      return reply.status(500).send({ error: '약 정보 조회 중 오류가 발생했습니다.' });
    }
  });
}
