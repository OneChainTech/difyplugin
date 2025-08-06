import { NextResponse } from 'next/server';
import { updateUserLocation, getNearbyUsers, setUserSharing } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { userId, name, latitude, longitude } = await request.json();

    if (!userId || !name || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await updateUserLocation(userId, name, latitude, longitude);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating user location:', error);
    return NextResponse.json({ error: 'Failed to update user location' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const nearbyUsers = await getNearbyUsers(userId, latitude, longitude);

    return NextResponse.json(nearbyUsers);
  } catch (error: any) {
    console.error('Error getting nearby users:', error);
    return NextResponse.json({ error: 'Failed to get nearby users' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId, isSharing } = await request.json();
    if (!userId || typeof isSharing !== 'boolean') {
      return NextResponse.json({ error: 'userId和isSharing必填' }, { status: 400 });
    }
    await setUserSharing(userId, isSharing);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating sharing status:', error);
    return NextResponse.json({ error: 'Failed to update sharing status' }, { status: 500 });
  }
} 