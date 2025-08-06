
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getDb } from '@/lib/db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

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

    // 1. AI Processing
    const prompt = `
      从以下文本中提取钓鱼信息，并以JSON格式返回。请识别鱼的种类、使用的鱼饵、鱼竿以及环境信息。
      环境信息应专注于描述钓鱼时的具体自然状况，如“天气晴朗，微风，水流平缓”或“阴天有雨，水质浑浊”。
      如果某项信息不存在，请使用 null 作为值。
      文本: "${message}"
      JSON格式示例: {"fish_type": "鲈鱼", "bait": "米诺", "rod": "5米手竿", "environment": "晴天, 微风, 水流平缓"}
    `;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'qwen-plus',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
    });

    let parsedContent;
    if (completion.choices[0].message.content) {
      try {
        parsedContent = JSON.parse(completion.choices[0].message.content);
      } catch (e) {
        return NextResponse.json({ error: 'AI response is not valid JSON' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'AI returned empty content' }, { status: 500 });
    }

    const { fish_type, bait, environment, rod } = parsedContent;

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
