import { Schema, models, model } from "mongoose";

export interface ISupplier {
  _id: string;
  name: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
}

const SupplierSchema = new Schema<ISupplier>({
  name: { type: String, required: true },
  contactEmail: { type: String },
  phone: { type: String },
  address: { type: String },
});

export const Supplier = models.Supplier || model<ISupplier>("Supplier", SupplierSchema);
