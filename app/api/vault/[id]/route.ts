import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../lib/mongodb';
import VaultItem from '../../../lib/models/VaultItem';
import { clientEncrypt } from '../../../lib/encryption';

const getUserFromToken = (request: Request) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
  return decoded;
};

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromToken(request);
    const { title, username, password, url, notes } = await request.json();

    await connectDB();

    // Encrypt password and notes server-side as well for double encryption
    const userEmail = user.email;
    const encryptedPassword = clientEncrypt(password, userEmail);
    const encryptedNotes = notes ? clientEncrypt(notes, userEmail) : '';

    const vaultItem = await VaultItem.findOneAndUpdate(
      { _id: params.id, userId: user.userId },
      {
        title,
        username,
        password: encryptedPassword,
        url,
        notes: encryptedNotes,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!vaultItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(vaultItem);
  } catch (error) {
    console.error('Update vault item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromToken(request);
    await connectDB();

    const vaultItem = await VaultItem.findOneAndDelete({
      _id: params.id,
      userId: user.userId,
    });

    if (!vaultItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete vault item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
