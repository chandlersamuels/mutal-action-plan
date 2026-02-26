import { z } from "zod";
import { TaskOwner, TaskStatus, DealStage, MapStatus } from "@prisma/client";

export const createDealSchema = z.object({
  name: z.string().min(1).max(255),
  clientId: z.string().cuid(),
  dealValue: z.number().positive().optional(),
  stage: z.nativeEnum(DealStage).optional(),
  targetCloseDate: z.string().datetime().optional(),
});

export const updateDealSchema = createDealSchema.partial();

export const createMapSchema = z.object({
  title: z.string().min(1).max(255),
  templateId: z.string().cuid().optional(),
});

export const updateMapSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  status: z.nativeEnum(MapStatus).optional(),
});

export const createPhaseSchema = z.object({
  name: z.string().min(1).max(255),
  displayOrder: z.number().int().min(0),
});

export const updatePhaseSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const createTaskSchema = z.object({
  phaseId: z.string().cuid(),
  title: z.string().min(1).max(255),
  owner: z.nativeEnum(TaskOwner),
  displayOrder: z.number().int().min(0),
  description: z.string().optional(),
  estimatedDays: z.number().int().positive().optional(),
  isClientVisible: z.boolean().optional(),
  isForecastMilestone: z.boolean().optional(),
  forecastProbability: z.number().int().min(0).max(100).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  owner: z.nativeEnum(TaskOwner).optional(),
  providerContact: z.string().optional(),
  clientContactId: z.string().cuid().optional(),
  estimatedDays: z.number().int().positive().optional(),
  targetDate: z.string().datetime().optional(),
  completedDate: z.string().datetime().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  dependsOn: z.array(z.string().cuid()).optional(),
  successCriteria: z.string().optional(),
  internalNotes: z.string().optional(),
  isClientVisible: z.boolean().optional(),
  isTbdWithClient: z.boolean().optional(),
  isForecastMilestone: z.boolean().optional(),
  forecastProbability: z.number().int().min(0).max(100).optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const clientUpdateTaskSchema = z.object({
  status: z.enum(["IN_PROGRESS", "COMPLETE", "AT_RISK", "BLOCKED"]).optional(),
  completedDate: z.string().datetime().optional(),
  note: z.string().optional(),
});

export const createShareTokenSchema = z.object({
  allowClientEdits: z.boolean().optional(),
  allowClientNotes: z.boolean().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const updateShareTokenSchema = z.object({
  isActive: z.boolean().optional(),
  allowClientEdits: z.boolean().optional(),
  allowClientNotes: z.boolean().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const reorderSchema = z.array(
  z.object({
    id: z.string().cuid(),
    displayOrder: z.number().int().min(0),
  })
);
