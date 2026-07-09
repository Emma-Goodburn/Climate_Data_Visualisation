import type {dataset} from "../../types";

export interface useDataProcessingContentProps {
  processingSteps: { step: string, value: any }[];
  setProcessingSteps: (steps: { step: string, value: any }[]) => void;
  setErrorMessage: (errorMessage: string) => void;
}

export interface DataProcessingContentProps {
  dataset: dataset;
  setDataset: (newDataset: dataset) => void;
  sources: { source: string, type: string }[];
  setErrorMessage: (errorMessage: string) => void;
}