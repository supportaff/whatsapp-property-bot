import { NextRequest } from 'next/server';

export function isAuthenticated(req: NextRequest): boolean {
  const cookie = req.cookies.get('admin_auth')?.value;
  if (!cookie) return false;
  try {
    const decoded = Buffer.from(cookie, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');
    return username === (process.env.ADMIN_USERNAME || 'admin') &&
           password === (process.env.ADMIN_PASSWORD || 'admin123');
  } catch {
    return false;
  }
}
