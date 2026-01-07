import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("trackbyte");
  const missions = await db.collection("missions").find({}).toArray();
  return NextResponse.json(missions);
}

export async function POST(request: Request) {
  const { title, status } = await request.json();
  const client = await clientPromise;
  const db = client.db("trackbyte");
  const result = await db.collection("missions").insertOne({
    title,
    status: status || "Pending",
    createdAt: new Date(),
  });
  return NextResponse.json(result);
}