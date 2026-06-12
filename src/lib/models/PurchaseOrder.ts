import { Schema, models, model, Types } from "mongoose";

export type POStatus = "DRAFT" | "ORDERED" | "RECEIVED" | "CANCELLED";

export interface IPurchaseOrderItem {
  _id: string;
  product: Types.ObjectId | string;
  quantity: number;
  costPrice: number;
}

export interface IPurchaseOrder {
  _id: string;
  supplier: Types.ObjectId | string;
  status: POStatus;
  expectedDate?: Date;
  items: IPurchaseOrderItem[];
  createdAt: Date;
}

const PurchaseOrderItemSchema = new Schema<IPurchaseOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  costPrice: { type: Number, required: true },
});

const PurchaseOrderSchema = new Schema<IPurchaseOrder>({
  supplier: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
  status: { type: String, enum: ["DRAFT", "ORDERED", "RECEIVED", "CANCELLED"], default: "DRAFT" },
  expectedDate: { type: Date },
  items: { type: [PurchaseOrderItemSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export const PurchaseOrder = models.PurchaseOrder || model<IPurchaseOrder>("PurchaseOrder", PurchaseOrderSchema);
