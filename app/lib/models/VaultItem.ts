// app/lib/models/VaultItem.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IVaultItem extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  username: string;
  password: string; // This will be encrypted
  url: string;
  notes: string; // This will be encrypted
  createdAt: Date;
  updatedAt: Date;
}

const VaultItemSchema = new Schema<IVaultItem>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const VaultItem = mongoose.models.VaultItem || mongoose.model<IVaultItem>('VaultItem', VaultItemSchema);

export default VaultItem;
