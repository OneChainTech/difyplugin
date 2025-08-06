import { NextResponse } from 'next/server';
import { sendExchangeRequest, getExchangeRequests } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { fromUserId, toUserId, message } = await request.json();

    if (!fromUserId || !toUserId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const requestId = await sendExchangeRequest(fromUserId, toUserId, message);

    return NextResponse.json({ success: true, requestId });
  } catch (error: any) {
    console.error('Error sending exchange request:', error);
    return NextResponse.json({ error: 'Failed to send exchange request' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const requests = await getExchangeRequests(userId);

    return NextResponse.json(requests);
  } catch (error: any) {
    console.error('Error getting exchange requests:', error);
    return NextResponse.json({ error: 'Failed to get exchange requests' }, { status: 500 });
  }
} 