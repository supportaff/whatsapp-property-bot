import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getClients, addClient, updateClient, deleteClient } from '@/lib/sheets';

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const clients = await getClients();
    return NextResponse.json({ clients });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch', clients: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  await addClient(data);
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  await updateClient(data.id, data);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  await deleteClient(id);
  return NextResponse.json({ success: true });
}
