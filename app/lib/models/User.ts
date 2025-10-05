// app/lib/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

// Define the User interface
export interface IUser extends Document {
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create the schema with proper TypeScript typing
const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Export the model with proper typing
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
