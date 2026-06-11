import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  const formData = await req.formData();
  const bestand = formData.get("bestand") as File;
  if (!bestand) return NextResponse.json({ error: "Geen bestand." }, { status: 400 });

  const blob = await put(`documenten/${Date.now()}-${bestand.name}`, bestand, {
    access: "public",
  });

  return NextResponse.json({
    url: blob.url,
    mimetype: bestand.type,
    grootte: bestand.size,
  });
}
