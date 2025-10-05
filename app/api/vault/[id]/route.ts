import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import VaultItem from '../../../lib/models/VaultItem';
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const userId = (decoded as { userId: string }).userId;

    const vaultItem = await VaultItem.findOne({ _id: params.id, userId });

    if (!vaultItem) {
      return NextResponse.json({ error: 'Vault item not found' }, { status: 404 });
    }

    return NextResponse.json(vaultItem);
  } catch (error: unknown) {  // Fixed: Properly type the error
    console.error('Vault GET error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const statusCode = (error as ApiError).status || 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const updatedVaultItem = await VaultItem.findOneAndUpdate(
      { _id: params.id, userId },
      { title, username, password, url, notes },
      { new: true }
    );

    if (!updatedVaultItem) {
      return NextResponse.json({ error: 'Vault item not found' }, { status: 404 });
    }

    return NextResponse.json(updatedVaultItem);
  } catch (error: unknown) {  // Fixed: Properly type the error
    console.error('Vault PUT error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const statusCode = (error as ApiError).status || 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const userId = (decoded as { userId: string }).userId;

    const deletedVaultItem = await VaultItem.findOneAndDelete({
      _id: params.id,
      userId,
    });

    if (!deletedVaultItem) {
      return NextResponse.json({ error: 'Vault item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Vault item deleted successfully' });
  } catch (error: unknown) {  // Fixed: Properly type the error
    console.error('Vault DELETE error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const statusCode = (error as ApiError).status || 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
