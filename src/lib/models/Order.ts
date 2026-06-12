import { Schema, models, model, Types } from "mongoose";

export type OrderStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export interface IOrderItem {
  _id: string;
  product: Types.ObjectId | string;
  quantity: number;
  price: number;
}

export interface IOrder {
  _id: string;
  customer?: Types.ObjectId | string;
  status: OrderStatus;
  totalAmount: number;
  items: IOrderItem[];
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const OrderSchema = new Schema<IOrder>({
  customer: { type: Schema.Types.ObjectId, ref: "Customer" },
  status: { type: String, enum: ["PENDING", "COMPLETED", "CANCELLED"], default: "PENDING" },
  totalAmount: { type: Number, default: 0 },
  items: { type: [OrderItemSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export const Order = models.Order || model<IOrder>("Order", OrderSchema);
