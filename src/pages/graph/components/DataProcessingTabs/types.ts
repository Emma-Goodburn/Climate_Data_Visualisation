import type {dataset} from "../../types";

export interface DataProcessingTabsProps {
    sources: { source: string, type: string }[];
    datasets: dataset[] | null;
    setDatasets: (datasets: dataset[]) => void;
    getRandomColour: (datasetColours: string[]) => string;
    setDatasetColours: (colours: string[]) => void;
    datasetColours: string[];
    setErrorMessage: (errorMessage: string) => void;
}

export interface useDataProcessingTabsProps {
    
}