import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

const MAX_GROOTTE = 20 * 1024 * 1024; // 20 MB

const TOEGESTAAN: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "text/plain": ".txt",
  "text/csv": ".csv",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

// Magic bytes per type
const MAGIC: { mime: string; bytes: number[] }[] = [
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: "application/zip", bytes: [0x50, 0x4B, 0x03, 0x04] }, // PK (docx/xlsx zijn zip)
  { mime: "image/jpeg", bytes: [0xFF, 0xD8, 0xFF] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4E, 0x47] },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF
  { mime: "application/msword", bytes: [0xD0, 0xCF, 0x11, 0xE0] }, // OLE2 (doc/xls)
];

function checkMagicBytes(buffer: Uint8Array, mime: string): boolean {
  // docx/xlsx/zip vallen onder PK magic
  if (mime.includes("openxmlformats") || mime.includes("zip")) {
    return buffer[0] === 0x50 && buffer[1] === 0x4B;
  }
  if (mime === "text/plain" || mime === "text/csv") return true; // tekst heeft geen magic
  const magic = MAGIC.find(m => m.mime === mime || (mime.startsWith("image/") && m.mime === mime));
  if (!magic) return true; // onbekend — door laten
  return magic.bytes.every((b, i) => buffer[i] === b);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  const formData = await req.formData();
  const bestand = formData.get("bestand") as File;
  if (!bestand) return NextResponse.json({ error: "Geen bestand." }, { status: 400 });

  // Grootte check
  if (bestand.size > MAX_GROOTTE) {
    return NextResponse.json({ error: "Bestand te groot. Maximum is 20 MB." }, { status: 400 });
  }

  // MIME type check
  const mime = bestand.type.toLowerCase();
  if (!TOEGESTAAN[mime]) {
    return NextResponse.json({
      error: `Bestandstype niet toegestaan. Toegestaan: PDF, Word, Excel, afbeeldingen, tekst.`,
    }, { status: 400 });
  }

  // Magic bytes check — echte bestandsinhoud valideren
  const buffer = new Uint8Array(await bestand.slice(0, 8).arrayBuffer());
  if (!checkMagicBytes(buffer, mime)) {
    return NextResponse.json({
      error: "Bestandsinhoud klopt niet met het opgegeven type.",
    }, { status: 400 });
  }

  // Veilige bestandsnaam — strip speciale tekens
  const veiligeNaam = bestand.name
    .replace(/[^a-zA-Z0-9._\-\s]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

  const blob = await put(`documenten/${Date.now()}-${veiligeNaam}`, bestand, {
    access: "public",
  });

  return NextResponse.json({
    url: blob.url,
    mimetype: mime,
    grootte: bestand.size,
  });
}
