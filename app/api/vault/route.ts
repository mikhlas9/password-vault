import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../lib/mongodb';
import VaultItem from '../../lib/models/VaultItem';

const getUserFromToken = (request: Request) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
  return decoded;
};

export async function GET(request: Request) {
  try {
    const user = getUserFromToken(request);
    await connectDB();

    const items = await VaultItem.find({ userId: user.userId })
      .sort({ createdAt: -1 });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Get vault items error:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = getUserFromToken(request);
    const { title, username, password, url, notes } = await request.json();

    await connectDB();

    const vaultItem = new VaultItem({
      userId: user.userId,
      title,
      username,
      password, // Already encrypted on client side
      url,
      notes, // Already encrypted on client side
    });

    await vaultItem.save();

    return NextResponse.json(vaultItem, { status: 201 });
  } catch (error) {
    console.error('Create vault item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
