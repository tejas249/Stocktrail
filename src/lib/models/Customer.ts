import { Schema, models, model } from "mongoose";

export interface ICustomer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
}

const CustomerSchema = new Schema<ICustomer>({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
});

export const Customer = models.Customer || model<ICustomer>("Customer", CustomerSchema);
