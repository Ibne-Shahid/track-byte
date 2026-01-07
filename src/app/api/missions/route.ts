import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playerName = searchParams.get("playerName");

  const client = await clientPromise;
  const db = client.db("trackbyte");
  const missions = await db.collection("missions").find({ playerName }).toArray();
  return NextResponse.json(missions);
}

export async function POST(request: Request) {
  const { title, isBoss, playerName } = await request.json();
  const client = await clientPromise;
  const db = client.db("trackbyte");
  
  const result = await db.collection("missions").insertOne({
    title,
    isBoss: isBoss || false,
    playerName,
    status: "Pending",
    createdAt: new Date(),
  });
  return NextResponse.json(result);
}