import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getOwned(req: NextRequest, id: string) {
  const token = req.cookies.get("token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return null;
  return prisma.conversation.findFirst({ where: { id, userId: payload.userId } });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conv = await getOwned(req, id);
  if (!conv) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(conv);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conv = await getOwned(req, id);
  if (!conv) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const { title } = await req.json();
  const updated = await prisma.conversation.update({
    where: { id },
    data: { title },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conv = await getOwned(req, id);
  if (!conv) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  await prisma.conversation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
