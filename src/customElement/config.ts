export type Config = Readonly<{
  // Optional: specify which analytics service to simulate (e.g., "google-analytics", "custom")
  analyticsService?: string;
  // Optional: refresh interval in minutes (for demo purposes)
  refreshInterval?: number;
}>;

export const isConfig = (value: Readonly<Record<string, unknown>> | null) =>
  value !== null; // use better check
