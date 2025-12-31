
export enum WorkflowStep {
  REQUIREMENTS = 'REQUIREMENTS',
  DESIGN = 'DESIGN',
  CODE = 'CODE',
  TESTS = 'TESTS',
  SIMULATION = 'SIMULATION'
}

export interface GeneratedAsset {
  requirements: string[];
  systemDesign: string;
  classDiagram: string;
  sequenceDiagram: string;
  sourceCode: {
    cpp: string;
    rust: string;
    java: string;
  };
  testCases: string[];
  complianceScore: number;
  standardsCompliance: string[];
  simData: {
    status: 'success' | 'failure';
    metrics: { name: string; value: number }[];
  };
}

export interface AppState {
  isGenerating: boolean;
  currentStep: WorkflowStep;
  asset: GeneratedAsset | null;
  error: string | null;
}
