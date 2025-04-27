// Google Search Console types
export interface GscProperty {
  siteUrl: string;
  permissionLevel: string;
}

export interface GscPropertiesResponse {
  properties: GscProperty[];
}

// Time range types
export type PredefinedTimeRange = 'last7days' | 'last28days' | 'last3months';

export type CustomTimeRange = {
  startDate: string; // ISO format
  endDate: string; // ISO format
};

export type TimeRange = PredefinedTimeRange | CustomTimeRange;

// GSC data types
export interface GscQueryData {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscDataResponse {
  rows: GscQueryData[];
}

// Gemini API types
export interface GeminiIntentRequest {
  query: string;
}

export interface GeminiIntentResponse {
  query: string;
  intent: string;
  category: string;
}

// Report types
export interface ReportData {
  query: string;
  metrics: Record<string, number>;
  intent?: {
    category: string;
    description: string;
  };
}