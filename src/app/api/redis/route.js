// src/app/api/redis/route.js
import { NextResponse } from 'next/server';
import client from '@/utils/redisClient';

export async function GET(request) {
    try {
        const key = request.nextUrl.searchParams.get('key');
        const value = await client.get(key);
        return NextResponse.json({ value }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching data' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { key, value } = await request.json();
        await client.set(key, value);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error saving data' }, { status: 500 });
    }
}
