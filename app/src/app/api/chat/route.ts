
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import OpenAI from 'openai';

// 本地解析钓鱼信息的函数
function parseFishingInfo(message: string) {
  const text = (message || '').toLowerCase();

  // 鱼类关键词（保持简单）
  const fishTypes = ['鲤鱼','鲫鱼','鲈鱼','草鱼','青鱼','鲢鱼','鳙鱼','黑鱼','鲶鱼','罗非鱼','翘嘴','白条','马口','溪哥','鲳鱼','黄骨鱼','鳜鱼','鳟鱼','泥鳅','鱼'];

  // 鱼饵（含路亚饵）- 去除“台钓/传统钓/路亚”等误判项
  const baitDefs: Array<{label: string; patterns: RegExp[]}> = [
    { label: '蚯蚓', patterns: [/蚯蚓/] },
    { label: '红虫', patterns: [/红虫|红线虫/] },
    { label: '玉米', patterns: [/玉米/] },
    { label: '麦粒', patterns: [/麦粒|麦子/] },
    { label: '面饵', patterns: [/面饵|面团|商品饵|饵料(?!架)/] },
    { label: '鲜虾', patterns: [/虾(?!皮|米)/] },
    { label: '米诺', patterns: [/米诺|minnow/i] },
    { label: '亮片', patterns: [/亮片/] },
    { label: '软虫', patterns: [/软虫/] },
    { label: 'VIB', patterns: [/\bVIB\b/i] },
    { label: 'JIG', patterns: [/\bJIG\b/i] },
    { label: '路亚饵', patterns: [/路亚饵|假饵|硬饵/] },
    { label: '鱼饵', patterns: [/鱼饵/] },
  ];

  // 鱼竿/钓法
  const rodDefs: Array<{label: string; patterns: RegExp[]}> = [
    { label: '手竿', patterns: [/手竿|手杆|溪流竿/] },
    { label: '台钓竿', patterns: [/台钓竿|台钓(?!饵)/] },
    { label: '路亚竿', patterns: [/路亚竿|路亚(?!饵|饵料)/] },
    { label: '海竿', patterns: [/海竿|抛竿/] },
    { label: '矶钓竿', patterns: [/矶钓竿|矶竿/] },
    { label: '筏钓竿', patterns: [/筏钓竿|筏竿/] },
    { label: '鱼竿', patterns: [/钓竿|鱼竿/] },
  ];

  const environments = ['晴天','阴天','雨天','微风','大风','水流平缓','水流湍急','水质清澈','水质浑浊','岸边','深水','浅水','桥下','河','湖','水库','池塘','溪流','江','海'];

  let fish_type: string | null = null;
  let bait: string | null = null;
  let rod: string | null = null;
  let environment: string | null = null;

  // 鱼类匹配：优先精确词
  for (const fish of fishTypes) {
    if (text.includes(fish.toLowerCase())) {
      fish_type = fish;
      break;
    }
  }

  // 工具函数：根据 patterns 进行匹配，优先返回更具体的项
  function matchByDefs(defs: Array<{label: string; patterns: RegExp[]}>, source: string): string | null {
    for (const def of defs) {
      if (def.patterns.some((re) => re.test(source))) return def.label;
    }
    return null;
  }

  bait = matchByDefs(baitDefs, text);
  rod  = matchByDefs(rodDefs, text);

  // 额外规则：若出现典型路亚饵而未写明竿，默认路亚竿
  const lureHint = [/米诺|minnow/i, /亮片/, /软虫/, /\bVIB\b/i, /\bJIG\b/i, /假饵|硬饵/].some(re => re.test(text));
  if (!rod && lureHint) {
    rod = '路亚竿';
  }

  // 环境信息匹配
  const foundEnvironments: string[] = [];
  for (const env of environments) {
    if (text.includes(env.toLowerCase())) foundEnvironments.push(env);
  }
  if (/天气|气候/.test(text)) {
    if (/晴|太阳/.test(text)) foundEnvironments.push('晴天');
    if (/阴|云/.test(text)) foundEnvironments.push('阴天');
    if (/雨|下雨/.test(text)) foundEnvironments.push('雨天');
  }
  if (/风/.test(text)) {
    if (/微|小/.test(text)) foundEnvironments.push('微风');
    if (/大|强/.test(text)) foundEnvironments.push('大风');
  }
  if (/水/.test(text)) {
    if (/清|干净/.test(text)) foundEnvironments.push('水质清澈');
    if (/浑|脏/.test(text)) foundEnvironments.push('水质浑浊');
    if (/急|快/.test(text)) foundEnvironments.push('水流湍急');
    if (/缓|慢/.test(text)) foundEnvironments.push('水流平缓');
  }
  if (/深水|深/.test(text)) foundEnvironments.push('深水');
  if (/浅水|浅/.test(text)) foundEnvironments.push('浅水');
  if (/岸|边/.test(text)) foundEnvironments.push('岸边');
  if (/桥/.test(text)) foundEnvironments.push('桥下');

  const uniqueEnvironments = [...new Set(foundEnvironments)];
  if (uniqueEnvironments.length > 0) environment = uniqueEnvironments.join(', ');

  // 更友好的默认值
  if (!fish_type) {
    fish_type = /钓|鱼/.test(text) ? '未知鱼类' : null;
  }
  if (!bait) {
    bait = /饵|诱/.test(text) ? '未知鱼饵' : null;
  }
  if (!rod) {
    rod = /竿|杆|钓/.test(text) ? '未知鱼竿' : null;
  }
  if (!environment) {
    environment = /河|湖|水/.test(text) ? '未知环境' : null;
  }

  return { fish_type, bait, environment, rod };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);
    
    const { message, latitude, longitude, userId } = body;

    if (!message || latitude === undefined || longitude === undefined || !userId) {
      console.log('Missing required fields:', { 
        message: !!message, 
        messageLength: message?.length,
        latitude, 
        longitude,
        userId,
        latitudeType: typeof latitude,
        longitudeType: typeof longitude
      });
      return NextResponse.json({ error: 'Message, location and userId are required' }, { status: 400 });
    }
    
    // 确保坐标是数字类型
    const lat = Number(latitude);
    const lng = Number(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      console.log('Invalid coordinates:', { latitude, longitude, lat, lng });
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    // 先尝试使用大模型抽取；失败则回退到本地解析
    async function extractWithLLM(userMessage: string) {
      try {
        const apiKey = process.env.QWEN_API_KEY || process.env.OPENAI_API_KEY || process.env.DASHSCOPE_API_KEY;
        if (!apiKey) throw new Error('Missing API key');
        const baseURL = process.env.QWEN_BASE_URL || process.env.OPENAI_BASE_URL || process.env.DASHSCOPE_BASE_URL;
        const model = process.env.LLM_MODEL || process.env.QWEN_MODEL || process.env.OPENAI_MODEL || 'qwen-plus';
        const client = new OpenAI({ apiKey, baseURL });

        const sys = `你是一个信息抽取引擎。根据用户的中文描述，抽取钓鱼相关信息，并只输出 JSON。字段：
        - fish_type: 主要目标鱼种（如 鲤鱼、黑鱼 等），未知填 null
        - bait: 使用的饵（如 蚯蚓、红虫、玉米、米诺、亮片、软虫、面饵 等），未知填 null
        - rod: 使用的鱼竿/钓法（如 手竿、台钓竿、路亚竿、海竿 等）。若出现典型路亚饵而未提及鱼竿，可推断为 路亚竿；未知填 null
        - environment: 环境/天气/水域描述，多个用逗号连接，未知填 null
        只输出 JSON，不要解释。`;

        const completion = await client.chat.completions.create({
          model,
          temperature: 0,
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: userMessage }
          ],
        });

        const content = completion.choices?.[0]?.message?.content || '{}';
        const parsed = JSON.parse(content);
        return {
          fish_type: parsed.fish_type ?? null,
          bait: parsed.bait ?? null,
          environment: parsed.environment ?? null,
          rod: parsed.rod ?? null,
        } as { fish_type: string|null; bait: string|null; environment: string|null; rod: string|null };
      } catch (e) {
        return parseFishingInfo(userMessage);
      }
    }

    const { fish_type, bait, environment, rod } = await extractWithLLM(message);

    // 2. Database Insertion
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO fishing_spots (user_id, latitude, longitude, fish_type, bait, environment, rod) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, lat, lng, fish_type, bait, environment, rod]
    );

    const lastID = result.lastID;

    // 3. Return the newly created spot
    const newSpot = await db.get('SELECT * FROM fishing_spots WHERE id = ?', lastID);

    return NextResponse.json(newSpot);

  } catch (error: any) {
    console.error('Error in chat/POST API:', error);
    const errorMessage = error.message || 'An unexpected error occurred';
    return NextResponse.json({ error: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  }
}
