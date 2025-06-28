import { NextResponse } from "next/server";
import { serverDatabases } from "@/lib/appwrite-server";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const LINKS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_LINKS_COLLECTION_ID!;

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const linkId = params.id;

  try {
    const link = await serverDatabases.getDocument(DATABASE_ID, LINKS_COLLECTION_ID, linkId);

    if (!link || !link.url) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    await serverDatabases.updateDocument(DATABASE_ID, LINKS_COLLECTION_ID, linkId, {
      clicks: (link.clicks || 0) + 1,
    });

    return NextResponse.redirect(link.url, 302);
  } catch (err) {
    console.error("Visit redirect error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
