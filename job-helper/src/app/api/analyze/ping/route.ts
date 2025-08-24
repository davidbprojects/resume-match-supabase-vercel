import { NextResponse } from 'next/server';
export async function GET() {

try {
    return NextResponse.json({ ok: true, now: new Date().toISOString() });
} catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Darn, Snap! Opps!" }, { status: 500 });
    }
}