const useGraph = () => {

  const getRandomColour = (datasetColours: string[]) => {
    const letters = '0123456789ABCDEF';
    let colour = '#';
    // Generate 3 digit hex code to help prevent very similar colours
    for (let i = 0; i < 3; i++) {
      colour += letters[Math.floor(Math.random() * 16)];
    }
    if (datasetColours.includes(colour)) {
      colour = getRandomColour(datasetColours);
    }
    
    return colour;
  }

  return {
    getRandomColour
  };

}

export default useGraph;