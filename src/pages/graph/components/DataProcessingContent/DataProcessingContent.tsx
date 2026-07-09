import { useEffect, useState } from "react";
import useDataProcessingContent from "./hooks";
import "./styles.css";
import type { DataProcessingContentProps } from "./types";

const DataProcessingContent  = ({ dataset, setDataset, sources, setErrorMessage }: DataProcessingContentProps) => {

  // Array of processing steps available
  const processingOptions = ['-', 'From (time)', 'To (time)', 'Last (samples)', 'Every (samples)', 'Scale (factor)', 'Offset (amount)', 'Detrend', 'Derivative', 'Integral', 'Mean (samples)', 'Custom'];

  const {
    processingValueChange,
    removeProcessingStep,
    addProcessingStep,
    stepChange,
    calculateProcessingSteps
  } = useDataProcessingContent({ processingSteps: dataset.processingSteps, setProcessingSteps: (newSteps) => setDataset({ ...dataset, processingSteps: newSteps }),  setErrorMessage});

  // Boolean variable for if the dataset needs updating with new processing steps
  const [updateDataset, setUpdateDataset] = useState<boolean>(false);
  
  // Run if dataset needs updating
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from server
        const response = await fetch(`http://localhost:4000/api/${dataset.source.toLowerCase()}`);
        const data = await response.json();
        // Apply processing steps to data and update
        setDataset({
          source: dataset.source,
          data: calculateProcessingSteps(data.series.map((item: any) => ({ x: item.date, y: item.value })), dataset.processingSteps),
          processingSteps: dataset.processingSteps,
          show: dataset.show,
          colour: dataset.colour
        }
        );
      } catch (error) {
        // Print error to console
        console.error('Error fetching data:', error);
      }
    }
    // Reset updateDataset once complete
    if (updateDataset) {
      fetchData();
      setUpdateDataset(false);
    }
  }, [updateDataset]);

  const ProcessingStep = (step: {step: string, value: any}, index: number) => {
    // Processing step component
    return (
      <div key={index} className="processing-step-row">
        {/* Select drop-down */}
        <select key={index} id={`step-select-${index}`} onChange={stepChange} value={step.step}>
          {processingOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {/* Show value input if needed */}
        <div className="value-container">
          { !["Normalise", "Derivative", "Integral", "Log base 10", "Detrend", "Custom"].includes(step.step) &&
            <input className="value-input" id={`value-${index}`} onChange={processingValueChange} type="text" value={step.value} ></input>
          }
          {step.step === "Custom" &&
            <div className="custom-value-inner-container">
              <p className="custom-value-text">{'Function(newData: {x: number, y: string}[]) => {'}</p>
              <textarea className="custom-value-input" id={`value-${index}`} onChange={(e) => processingValueChange(e)} value={step.value} placeholder="Enter JavaScript to apply to this graphs data."></textarea>
              <p className="custom-value-text">{'}'}</p>
            </div>
          }
        </div>
        {/* Remove processing step */}
        <button className="button remove-button" onClick={() => removeProcessingStep(index)}>Remove</button>
      </div>
    )
  }

  return (
    <div className="data-processing-content">
      {/* Show dataset checkbox */}
      <div className="data-toggle">
        <input
          id="dataset-toggle"
          type="checkbox"
          checked={dataset.show}
          onChange={() => setDataset({ ...dataset, show: !dataset.show })}
        />
        <label>Show Dataset</label>
      </div>
      <div className="data-options-form">
        {/* Data source selection */}
        <label htmlFor="data-source-select">Data Source</label>
        <select id="data-source-select" value={dataset.source} onChange={(e) => setDataset({...dataset, source: e.target.value})}>
          {sources.map((source) => (
            <option key={source.source} value={source.source}>{source.source + ' (' + source.type + ')'}</option>
          ))}
        </select>
        {/* Processing step labels */}
        {dataset?.processingSteps.length > 0 &&
          <div className="labels-container">
            <label className="labels" htmlFor="step-select-0">Processing steps</label>
            <label className="labels" htmlFor="value-0">Value</label>
          </div>
        }
        {/* Show required processing steps */}
        <div className="processing-step-container">
          {dataset.processingSteps.map((step, index) => (
            ProcessingStep(step, index)
          ))}
        </div>
        {/* New/add processing step and update buttons */}
        <div className="dataset-processing-button-group">
          <button className="button add-step-button" onClick={addProcessingStep}>{`${dataset?.processingSteps.length > 0 ? "New step" : "Add processing step"}`}</button>
          <button className="button update-dataset-button" onClick={() => setUpdateDataset(true)}>Update dataset</button>
        </div>
      </div>
    </div>
  )
};



export default DataProcessingContent;