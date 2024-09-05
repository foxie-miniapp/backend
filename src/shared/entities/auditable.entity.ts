import { Document, Schema } from 'mongoose';

export interface IAuditable extends Document {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date;
}

export const auditableSchema = new Schema<IAuditable>(
  {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedAt: { type: Date },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

// Middleware to handle soft deletes
auditableSchema.pre('find', function () {
  void this.where({ deletedAt: null });
});

auditableSchema.pre('findOne', function () {
  void this.where({ deletedAt: null });
});

// Method to soft delete a document
auditableSchema.methods.softDelete = function (deletedBy?: string) {
  this.deletedAt = new Date();
  if (deletedBy) {
    this.updatedBy = deletedBy;
  }
  return this.save();
};

// Function to create an auditable model
export function createAuditableModel<T extends IAuditable>(name: string, schema: Schema<T>) {
  return schema.add(auditableSchema);
}
