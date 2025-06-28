import { NextRequest, NextResponse } from "next/server";
import { serverDatabases } from "@/lib/appwrite-server";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const LINKS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_LINKS_COLLECTION_ID!;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parts = url.pathname.split("/");
  const linkId = parts[parts.length - 1];

  try {
    const link = await serverDatabases.getDocument(
      DATABASE_ID,
      LINKS_COLLECTION_ID,
      linkId
    );

    await serverDatabases.updateDocument(
      DATABASE_ID,
      LINKS_COLLECTION_ID,
      linkId,
      {
        clicks: (link.clicks || 0) + 1,
      }
    );

    return NextResponse.redirect(link.url, { status: 302 });
  } catch (err) {
    console.error("Visit redirect error:", err);
    return new NextResponse("Link not found or failed to redirect", {
      status: 500,
    });
  }
}
