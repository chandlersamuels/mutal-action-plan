import type {
  Organization,
  User,
  Client,
  ClientContact,
  Deal,
  Map,
  MapPhase,
  MapTask,
  MapShareToken,
  MapActivity,
  MapTemplate,
  MapTemplatePhase,
  MapTemplateTask,
  Notification,
  UserRole,
  TaskOwner,
  TaskStatus,
  DealStage,
  MapStatus,
  NotificationType,
  NotificationStatus,
} from "@prisma/client";

// Re-export Prisma types for convenience
export type {
  Organization,
  User,
  Client,
  ClientContact,
  Deal,
  Map,
  MapPhase,
  MapTask,
  MapShareToken,
  MapActivity,
  MapTemplate,
  MapTemplatePhase,
  MapTemplateTask,
  Notification,
  UserRole,
  TaskOwner,
  TaskStatus,
  DealStage,
  MapStatus,
  NotificationType,
  NotificationStatus,
};

// Extended types with relations
export type MapWithPhases = Map & {
  phases: (MapPhase & {
    tasks: MapTask[];
  })[];
  shareTokens: MapShareToken[];
};

export type DealWithRelations = Deal & {
  client: Client;
  owner: User;
  map: Map | null;
};

export type MapTaskWithRelations = MapTask & {
  clientContact: ClientContact | null;
};

export type TemplateWithPhases = MapTemplate & {
  phases: (MapTemplatePhase & {
    tasks: MapTemplateTask[];
  })[];
};

// Client-safe types (no internalNotes, no forecast data)
export type ClientSafeTask = Omit<
  MapTask,
  "internalNotes" | "isForecastMilestone" | "forecastProbability"
>;

export type ClientSafeMap = Omit<Map, never> & {
  phases: (MapPhase & {
    tasks: ClientSafeTask[];
  })[];
};

// API response types
export type ApiError = {
  error: string;
  details?: unknown;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

// Forecast types
export type ForecastMilestone = {
  taskId: string;
  title: string;
  targetDate: Date | null;
  probability: number;
  status: TaskStatus;
  isAtRisk: boolean;
};

export type ForecastSummary = {
  milestones: ForecastMilestone[];
  weightedCloseDate: Date | null;
  overallProbability: number;
};
