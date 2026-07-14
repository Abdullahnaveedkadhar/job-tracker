export type DiscoveredJob = {
  company: string;
  role: string;
  location?: string;
  jobUrl: string;
  jobDescription?: string;
  salary?: string;
  source: string;
};

export type RankedJob = DiscoveredJob & {
  rankScore: number;
  matchReason: string;
};
