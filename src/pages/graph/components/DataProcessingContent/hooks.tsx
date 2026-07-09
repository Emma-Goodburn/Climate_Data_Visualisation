import type { useDataProcessingContentProps } from "./types";


const useDataProcessingContent = (props: useDataProcessingContentProps) => { 

  const { processingSteps, setProcessingSteps, setErrorMessage } = props;

  const processingValueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Update processing step value
    const index = parseInt(e.target.id.split('-')[1]);
    setProcessingSteps(processingSteps.map((step, i) => {
      if (i === index) {
        return { ...step, value: e.target.value };
      }
      return step;
    }))
  };

  const removeProcessingStep = (index: number) => {
    // Delete processing step
    setProcessingSteps(processingSteps.filter((_, i) => i !== index));
  };

  const addProcessingStep = () => {
    // Add skeleton processing step
    setProcessingSteps([...processingSteps, { step: '-', value: '' }]);
  }

  const stepChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Update processing step
    const index = parseInt(e.target.id.split('-')[2]);
    setProcessingSteps(processingSteps.map((step, i) => {
      if (i === index) {
        return { ...step, step: e.target.value };
      }
      return step;
    }))
  };

  const calculateProcessingSteps = (data: any[], processingSteps: {step: string, value: any}[]) => {

    let newData = data;
    processingSteps.map((step) => {
      switch (step.step) {
        case "From (time)":
          // remove data before year given
          newData = newData.filter((data) => {
            if (new Date(data.x) > new Date(new Date().setFullYear(step.value, 0, 0))) {
              return data;
            }
          })
          break
        
        case "To (time)":
          // remove data after year given
          newData = newData.filter((data) => new Date(data.x) < new Date(new Date().setFullYear(step.value, 1, 0)))
          break
        
        case "Last (samples)":
          // only keep last x samples
          newData = newData.slice(-step.value);
          break
        
        case "Every (samples)":
          // keep data if multiple of x
          newData = newData.filter((data, index) => {
            if (index % step.value === 0) {
              return data;
            }
          })
          break
        
        case "Scale (factor)":
          // multiply each value by given scale factor
          newData = newData.map((each) => {
            return {...each, y: each.y * step.value}
          })
          break
        
        case "Offset (amount)":
          // add value to each datapoint
          newData = newData.map((each) => {
            return {...each, y: String(Number(each.y) + Number(step.value))}
          })
          break
        
        case "Detrend":
          // calculate sum of required values
          const n = newData.length;
          let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
          newData.map((datapoint, index) => {
            sumX += index;
            sumY += Number(datapoint.y);
            sumXY += index * Number(datapoint.y);
            sumXX += index * index;
          });

          // calculate trend slope and intercept with OLS
          const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
          const intercept = (sumY - slope * sumX) / n;

          // remove trend value from each y
          const detrendedData = newData.map((datapoint, index) => {
            const trendValue = (slope * index) + intercept;
            const detrendedY = Number(datapoint.y) - trendValue;

            return { x: datapoint.x, y: detrendedY };
          })
          newData = detrendedData;
          break
        
        case "Derivative":
          newData = newData.map((data, index) => {
            // remove first value because no difference can be found
            if (index === 0)
              return
            // calculate difference
            const prev = newData[index - 1];
            const dy = Number(data.y) - Number(prev.y);
            const d1 = new Date(data.x), d2 = new Date(prev.x)
            // account for any gaps in data
            const dx = ((d2.getFullYear() - d1.getFullYear()) * 12) - d1.getMonth() + d2.getMonth();

            return { x: data.x, y: dy/dx };
          }).slice(1);
          console.log(newData);
          break
        
        case "Integral":
          let totalArea = 0;
          newData = newData.map((data, index) => {
            if (index === newData.length - 1)
              return;
            // calculate area under current and next points
            const d1 = new Date(data.x), d2 = new Date(newData[index + 1].x)
            const dt = ((d2.getFullYear() - d1.getFullYear()) * 12) - d1.getMonth() + d2.getMonth();
            totalArea += ((Number(data.y) + Number(newData[index + 1].y)) / 2) * dt
            // add current running total to data
            return { x: data.x, y: totalArea }
          }).slice(0, -1);
          break
        
        case "Mean (samples)":
          const yValues = newData.map((data) => {
              return Number(data.y)
          })
          newData = newData.map((data, index) => {
            if (index < step.value)
              return;
            const mean = (yValues.slice(index - Number(step.value), index).reduce((a, b) => a + b, 0)) / Number(step.value);
            return { x: data.x, y: mean}
          }).slice(step.value)
          break
        
        case "Custom":
          // run custom function stored as a string in value, passing it newData to edit
          try {
            let customFunction = new Function("newData", step.value);
            newData = customFunction(newData);
          } catch (error) {
            setErrorMessage("Custom function failed, an error has occured: " + error);
          }
          break

      }
    })

    return newData;
  }

  return {
    processingValueChange,
    removeProcessingStep,
    addProcessingStep,
    stepChange,
    calculateProcessingSteps
  };
}

export default useDataProcessingContent;