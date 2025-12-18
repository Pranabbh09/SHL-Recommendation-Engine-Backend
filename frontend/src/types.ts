export interface Assessment {
  url: string;
  name: string;
  adaptive_support: string;
  description: string;
  duration: number;
  remote_support: string;
  test_type: string[];
}

export interface RecommendResponse {
  recommended_assessments: Assessment[];
}
