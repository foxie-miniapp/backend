import * as mongoose from 'mongoose';
import { createAuditableModel, IAuditable } from 'src/shared/entities/auditable.entity';

interface IUser extends IAuditable {
  name: string;
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema<IUser>({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Add auditable fields to the user schema
createAuditableModel('User', userSchema);

const User = mongoose.model<IUser>('User', userSchema);

export default User;
