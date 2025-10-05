import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../lib/mongodb';
import { getCurrentUser } from '../../lib/auth';
import { encryptVaultItem, decryptVaultItem } from '../../lib/crypto';

// Get all vault items for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { db } = await connectToDatabase();
    const items = await db.collection('vault_items')
      .find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Decrypt items using user's email as key
    const decryptedItems = items.map(item => 
      decryptVaultItem(item, user.email)
    );
    
    return NextResponse.json({ items: decryptedItems });
  } catch (error) {
    console.error('Get vault items error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create new vault item
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const itemData = await request.json();
    const { title, username, password, url, notes } = itemData;
    
    if (!title || !username || !password) {
      return NextResponse.json({ error: 'Title, username, and password are required' }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    
    // Encrypt the item using user's email as key
    const encryptedItem = encryptVaultItem({
      title,
      username,
      password,
      url: url || '',
      notes: notes || '',
    }, user.email);
    
    const result = await db.collection('vault_items').insertOne({
      ...encryptedItem,
      userId: user.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return NextResponse.json({ 
      message: 'Item created successfully',
      id: result.insertedId 
    });
  } catch (error) {
    console.error('Create vault item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update vault item
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const itemData = await request.json();
    const { _id, title, username, password, url, notes } = itemData;
    
    if (!_id || !title || !username || !password) {
      return NextResponse.json({ error: 'ID, title, username, and password are required' }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    
    // Encrypt the updated item
    const encryptedItem = encryptVaultItem({
      title,
      username,
      password,
      url: url || '',
      notes: notes || '',
    }, user.email);
    
    const result = await db.collection('vault_items').updateOne(
      { _id: new ObjectId(_id), userId: user.userId },
      {
        $set: {
          ...encryptedItem,
          updatedAt: new Date(),
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error('Update vault item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete vault item
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    
    const result = await db.collection('vault_items').deleteOne({
      _id: new ObjectId(id),
      userId: user.userId
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete vault item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
