import { Schema, models, model } from "mongoose";

export interface ILocation {
  _id: string;
  name: string;
  address?: string;
}

const LocationSchema = new Schema<ILocation>({
  name: { type: String, required: true },
  address: { type: String },
});

export const Location = models.Location || model<ILocation>("Location", LocationSchema);
