import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../src/lib/models/User";
import { Location } from "../src/lib/models/Location";
import { Supplier } from "../src/lib/models/Supplier";
import { Product } from "../src/lib/models/Product";
import { Stock } from "../src/lib/models/Stock";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  await mongoose.connect(uri);

  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await User.findOneAndUpdate(
    { email: "admin@stocktrail.app" },
    { name: "Admin User", email: "admin@stocktrail.app", password: passwordHash, role: "ADMIN" },
    { upsert: true, new: true }
  );

  const warehouse = await Location.findOneAndUpdate(
    { name: "Main Warehouse" },
    { name: "Main Warehouse", address: "123 Industrial Ave" },
    { upsert: true, new: true }
  );

  let supplier = await Supplier.findOne({ name: "Acme Supplies Co." });
  if (!supplier) {
    supplier = await Supplier.create({
      name: "Acme Supplies Co.",
      contactEmail: "sales@acmesupplies.com",
      phone: "+1-555-0100",
    });
  }

  let product = await Product.findOne({ sku: "WM-001" });
  if (!product) {
    product = await Product.create({
      name: "Wireless Mouse",
      sku: "WM-001",
      category: "Electronics",
      barcode: "8901234567890",
      reorderThreshold: 10,
      price: 19.99,
      costPrice: 8.5,
      supplier: supplier._id,
    });

    await Stock.create({ product: product._id, location: warehouse._id, quantity: 25 });
  }

  console.log("Seed complete:", { admin: admin.email, warehouse: warehouse.name, product: product.name });
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
