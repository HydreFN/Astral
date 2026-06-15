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

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conv = await getOwned(req, id);
  if (!conv) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const { role, content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Contenu vide" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: { conversationId: id, role: role || "user", content: content.trim() },
  });

  if (role === "user") {
    const count = await prisma.message.count({ where: { conversationId: id } });
    if (count === 1) {
      const title = content.trim().slice(0, 60) + (content.trim().length > 60 ? "..." : "");
      await prisma.conversation.update({ where: { id }, data: { title } });
    } else {
      await prisma.conversation.update({
        where: { id },
        data: { updatedAt: new Date() },
      });
    }
  }

  return NextResponse.json(message, { status: 201 });
}
