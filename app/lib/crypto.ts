import CryptoJS from 'crypto-js';
import { VaultItemDecrypted } from './types';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-please-change-this-key';

export const encrypt = (text: string, key?: string): string => {
  try {
    const encryptionKey = key || ENCRYPTION_KEY;
    const encrypted = CryptoJS.AES.encrypt(text, encryptionKey).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

export const decrypt = (encryptedText: string, key?: string): string => {
  try {
    const encryptionKey = key || ENCRYPTION_KEY;
    const bytes = CryptoJS.AES.decrypt(encryptedText, encryptionKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      throw new Error('Failed to decrypt - invalid data');
    }

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

// Define encrypted item type
export interface VaultItemEncrypted {
  _id?: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Encrypt vault item fields
export const encryptVaultItem = (
  item: Omit<VaultItemDecrypted, '_id' | 'createdAt' | 'updatedAt'>,
  userKey: string
): VaultItemEncrypted => {
  return {
    title: encrypt(item.title, userKey),
    username: encrypt(item.username, userKey),
    password: encrypt(item.password, userKey),
    url: item.url ? encrypt(item.url, userKey) : '',
    notes: item.notes ? encrypt(item.notes, userKey) : '',
  };
};

// Decrypt vault item fields
export const decryptVaultItem = (item: VaultItemEncrypted, userKey: string): VaultItemDecrypted => {
  try {
    return {
      _id: item._id?.toString(),
      title: decrypt(item.title, userKey),
      username: decrypt(item.username, userKey),
      password: decrypt(item.password, userKey),
      url: item.url ? decrypt(item.url, userKey) : '',
      notes: item.notes ? decrypt(item.notes, userKey) : '',
      createdAt: item.createdAt || new Date(),
      updatedAt: item.updatedAt || new Date(),
    };
  } catch (error) {
    console.error('Failed to decrypt vault item:', error);
    throw new Error('Failed to decrypt vault item');
  }
};
