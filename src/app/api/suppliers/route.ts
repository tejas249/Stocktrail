import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB, serialize } from "@/lib/mongodb";
import { Supplier } from "@/lib/models/Supplier";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  contactEmail: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const suppliers = await Supplier.find().sort({ name: 1 }).lean();
  return NextResponse.json(serialize({ suppliers }));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supplier = await Supplier.create({
    ...parsed.data,
    contactEmail: parsed.data.contactEmail || undefined,
  });
  return NextResponse.json(serialize({ supplier }), { status: 201 });
}
