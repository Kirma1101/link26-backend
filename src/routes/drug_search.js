// src/routes/drug_search.js
// 식품의약품안전처_의약품개요정보(e약은요) + 낱알식별 정보 API 연동

export async function drugSearchRoutes(fastify) {
  // GET /v1/public/easy-drug?itemName=약이름 — e약은요 API
  fastify.get('/v1/public/easy-drug', async (req, reply) => {
    const query = decodeURIComponent(req.query.itemName ?? req.query.q ?? '');
    if (!query.trim()) {
      return reply.status(400).send({ error: '검색어를 입력해주세요.' });
    }

    const serviceKey = process.env.PUBLIC_DATA_SERVICE_KEY2 ?? process.env.PUBLIC_DATA_SERVICE_KEY;
    if (!serviceKey) {
      return reply.status(500).send({ error: 'API 키가 설정되지 않았습니다.' });
    }

    try {
      // 1차: e약은요 API 검색
      const url1 = new URL('http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList');
      url1.searchParams.set('serviceKey', serviceKey);
      url1.searchParams.set('itemName', query);
      url1.searchParams.set('type', 'json');
      url1.searchParams.set('numOfRows', '10');
      url1.searchParams.set('pageNo', '1');

      const res1 = await fetch(url1.toString());
      const data1 = await res1.json();
      const items1 = data1?.body?.items ?? [];

      // 2차: 낱알식별 API 검색 (e약은요에 없을 경우 보완)
      const url2 = new URL('http://apis.data.go.kr/1471000/MdcinGrnIdntfcInfoService01/getMdcinGrnIdntfcInfoList01');
      url2.searchParams.set('serviceKey', serviceKey);
      url2.searchParams.set('itemName', query);
      url2.searchParams.set('type', 'json');
      url2.searchParams.set('numOfRows', '10');
      url2.searchParams.set('pageNo', '1');

      const res2 = await fetch(url2.toString());
      const data2 = await res2.json();
      const items2 = data2?.body?.items ?? [];

      // e약은요 결과 변환
      const results1 = items1.map(item => ({
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
        source: 'easy-drug',
      }));

      // 낱알식별 결과 변환 (e약은요에 없는 것만)
      const existingNames = new Set(results1.map(r => r.name));
      const results2 = items2
        .filter(item => !existingNames.has(item.ITEM_NAME))
        .map(item => ({
          id: item.ITEM_SEQ,
          name: item.ITEM_NAME,
          company: item.ENTP_NAME,
          effect: item.ETC_OTC_NAME ?? '',
          usage: item.DRUG_SHAPE ?? '',
          caution: '',
          interaction: '',
          sideEffect: '',
          storage: '',
          image: item.ITEM_IMAGE ?? null,
          source: 'pill-id',
        }));

      const results = [...results1, ...results2];
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

    const serviceKey = process.env.PUBLIC_DATA_SERVICE_KEY2 ?? process.env.PUBLIC_DATA_SERVICE_KEY;

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