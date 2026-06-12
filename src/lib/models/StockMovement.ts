import { Schema, models, model, Types } from "mongoose";

export type MovementType = "IN" | "OUT" | "TRANSFER_IN" | "TRANSFER_OUT";

export interface IStockMovement {
  _id: string;
  product: Types.ObjectId | string;
  location: Types.ObjectId | string;
  type: MovementType;
  quantity: number;
  reason?: string;
  user: Types.ObjectId | string;
  relatedTransferId?: string;
  createdAt: Date;
}

const StockMovementSchema = new Schema<IStockMovement>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  location: { type: Schema.Types.ObjectId, ref: "Location", required: true },
  type: { type: String, enum: ["IN", "OUT", "TRANSFER_IN", "TRANSFER_OUT"], required: true },
  quantity: { type: Number, required: true },
  reason: { type: String },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  relatedTransferId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const StockMovement = models.StockMovement || model<IStockMovement>("StockMovement", StockMovementSchema);
