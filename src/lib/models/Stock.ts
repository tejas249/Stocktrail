import { Schema, models, model, Types } from "mongoose";

export interface IStock {
  _id: string;
  product: Types.ObjectId | string;
  location: Types.ObjectId | string;
  quantity: number;
}

const StockSchema = new Schema<IStock>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  location: { type: Schema.Types.ObjectId, ref: "Location", required: true },
  quantity: { type: Number, default: 0 },
});

StockSchema.index({ product: 1, location: 1 }, { unique: true });

export const Stock = models.Stock || model<IStock>("Stock", StockSchema);
