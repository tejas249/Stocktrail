import { Schema, models, model, Types } from "mongoose";

export interface IProductVariant {
  _id: string;
  size?: string;
  color?: string;
  sku: string;
}

export interface IProduct {
  _id: string;
  name: string;
  sku: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  barcode?: string;
  reorderThreshold: number;
  price: number;
  costPrice: number;
  supplier?: Types.ObjectId | string;
  variants: IProductVariant[];
  createdAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>({
  size: { type: String },
  color: { type: String },
  sku: { type: String, required: true },
});

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String },
  description: { type: String },
  imageUrl: { type: String },
  barcode: { type: String, unique: true, sparse: true },
  reorderThreshold: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  costPrice: { type: Number, default: 0 },
  supplier: { type: Schema.Types.ObjectId, ref: "Supplier" },
  variants: { type: [ProductVariantSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export const Product = models.Product || model<IProduct>("Product", ProductSchema);
