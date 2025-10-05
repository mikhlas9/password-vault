import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../lib/mongodb';
import VaultItem from '../../lib/models/VaultItem';
import jwt from 'jsonwebtoken';

// Define proper error interface
interface ApiError extends Error {
  status?: number;
  code?: string;
}

// Helper function to verify JWT token
function verifyToken(token: string) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const userId = (decoded as { userId: string }).userId;

    const vaultItems = await VaultItem.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json(vaultItems);
  } catch (error: unknown) {  // Fixed: Properly type the error
    console.error('Vault GET error:', error);
    
    // Type guard to check if error has message property
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const statusCode = (error as ApiError).status || 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const userId = (decoded as { userId: string }).userId;

    const body = await request.json();
    const { title, username, password, url, notes } = body;

    if (!title || !username || !password) {
      return NextResponse.json(
        { error: 'Title, username, and password are required' },
        { status: 400 }
      );
    }

    const newVaultItem = new VaultItem({
      userId,
      title,
      username,
      password,
      url: url || '',
      notes: notes || '',
    });

    await newVaultItem.save();

    return NextResponse.json(newVaultItem, { status: 201 });
  } catch (error: unknown) {  // Fixed: Properly type the error
    console.error('Vault POST error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const statusCode = (error as ApiError).status || 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
