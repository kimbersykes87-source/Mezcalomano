import { getDb } from "@/db";
import { auditLog } from "@/db/schema";
import { createId } from "@/lib/ids";

export const writeAuditLog = async (params: {
  actorType: string;
  actorId?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}) => {
  const db = getDb();
  await db.insert(auditLog).values({
    id: createId("audit"),
    actorType: params.actorType,
    actorId: params.actorId ?? null,
    action: params.action,
    targetType: params.targetType ?? null,
    targetId: params.targetId ?? null,
    metadataJson: params.metadata ? JSON.stringify(params.metadata) : null,
    ipAddress: params.ipAddress ?? null,
    createdAt: Date.now(),
  });
};
