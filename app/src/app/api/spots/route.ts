
import { NextResponse } from 'next/server';
import { getSpotsByUser, addSpot } from '@/lib/db';
import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const spots = await getSpotsByUser(userId);
    return NextResponse.json(spots);
  } catch (error) {
    console.error('Error fetching spots:', error);
    return NextResponse.json({ error: 'Failed to fetch spots' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, latitude, longitude, fish_type, bait, environment, rod } = await request.json();
    if (!userId || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'userId, latitude, longitude 必填' }, { status: 400 });
    }
    const id = await addSpot(userId, latitude, longitude, fish_type || '', bait || '', environment || '', rod || '');
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error adding spot:', error);
    return NextResponse.json({ error: 'Failed to add spot' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    if (!id || !userId) {
      return NextResponse.json({ error: 'id and userId required' }, { status: 400 });
    }
    const db = await getDb();
    const result = await db.run('DELETE FROM fishing_spots WHERE id = ? AND user_id = ?', id, userId);
    if ((result.changes ?? 0) > 0) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Not found or not allowed' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting spot:', error);
    return NextResponse.json({ error: 'Failed to delete spot' }, { status: 500 });
  }
}
