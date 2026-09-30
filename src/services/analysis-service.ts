import { mockAnalysis } from "@/data/mock-analysis";
import type { AnalysisResponse } from "@/types/analysis";

/** Frontend-only seam. Replace this implementation when the real analysis service exists. */
export const analysisService = {
  getDemoAnalysis(): AnalysisResponse {
    return mockAnalysis;
  },
};