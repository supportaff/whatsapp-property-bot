import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const validUser = process.env.ADMIN_USERNAME || 'admin';
  const validPass = process.env.ADMIN_PASSWORD || 'admin123';

  if (username === validUser && password === validPass) {
    const res = NextResponse.json({ success: true });
    res.cookies.set('admin_auth', Buffer.from(`${username}:${password}`).toString('base64'), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    return res;
  }
  return NextResponse.json({ success: false }, { status: 401 });
}
