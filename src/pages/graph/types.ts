export interface dataset {
  source: string;
  data: any[];
  processingSteps: { step: string, value: any }[];
  show: boolean;
  colour: string;
}