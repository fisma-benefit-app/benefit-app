import { ChangeEvent, FormEvent, useState } from "react"
import { baseFunctionalComponentClasses, baseFunctionalComponentTypes, ComponentTypes } from "./classesAndTypes"

const CalculationDemo = () => {

  //TODO: maybe finnish language in the ui for this demo, refactoring as issues are noticed, implement calculation logic based on collected info

  //define type for collected form data and the state where the data is stored
  type CalculationData = {
    baseFunctionalComponentClass: string,
    baseFunctionalComponentType: string,
    dataElements: number,
    readingReferences: number,
    writingReferences: number,
    functionalityMultiplier: number
  }

  //state where collected form data is stored
  const [calculationData, setCalculationData] = useState<CalculationData>({
    baseFunctionalComponentClass: "Interactive end-user navigation and query service",
    baseFunctionalComponentType: "function designators",
    dataElements: 1,
    readingReferences: 1,
    writingReferences: 1,
    functionalityMultiplier: 1
  })

  //state for storing and rendering calculated result
  const [result, setResult] = useState<number>(0);

  //handles state update for baseFunctionalComponentClass, and also updates baseFunctionalComponentType in the state accordingly since available types change based on class
  //Using type assertion because TypeScript doesn't know if baseFunctionalComponentTypes has a key matching e.target.value
  const handleBaseFunctionalComponentClass = (e: ChangeEvent<HTMLSelectElement>) => {
    setCalculationData({ ...calculationData, baseFunctionalComponentClass: e.target.value, baseFunctionalComponentType: baseFunctionalComponentTypes[e.target.value as keyof ComponentTypes][0] });
  }

  //update state based on user input
  const handleChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setCalculationData({ ...calculationData, [e.target.id]: e.target.value });
  }

  //TODO: implement calculation logic here
  const calculateFunctionalPoints = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(calculationData)
    switch(calculationData.baseFunctionalComponentClass) {
      case "Interactive end-user navigation and query service":
        setResult(0.2 + calculationData.dataElements/7 + calculationData.readingReferences/2);
        if (calculationData.baseFunctionalComponentType !== "function designators" || 
          calculationData.baseFunctionalComponentType !== "function lists" || 
          calculationData.baseFunctionalComponentType !== "selection lists") {
        setResult(0.2 + (calculationData.dataElements + 1)/7 + calculationData.readingReferences/2);
      }
        break;
      case "Interactive end-user input service":
        setResult(calculationData.functionalityMultiplier * (0.2 + calculationData.dataElements/5 + calculationData.writingReferences/1.5 + calculationData.readingReferences/2));
        break;
      case "Non-interactive end-user output service":
        setResult(1 + calculationData.dataElements/5 + calculationData.readingReferences/2);
        break;
      case "Interface service to other applications":
        setResult(0.5 + calculationData.dataElements/7 + calculationData.readingReferences/2);
        break;
      case "Interface service from other applications":
        setResult(0.2 + calculationData.dataElements/5 + calculationData.writingReferences/1.5 + calculationData.readingReferences/2);
        break;
      case "Data storage service":
        setResult(1.5 + calculationData.dataElements/4);
        break;
      case "Algorithmic or manipulation service":
      setResult(0.1 + calculationData.dataElements/5 + o/3);
      break;
    }
  }

  return (
    //form for collecting calculation data
    <form onSubmit={calculateFunctionalPoints} className='flex flex-col gap-10 items-center flex-wrap'>
      <div className="flex gap-10 justify-center flex-wrap">
        <div className="flex flex-col gap-5 items-center">
          <label htmlFor="baseFunctionalComponentClass">Base Functional Component Class</label>
          <select className="border-2 rounded-2xl px-4 py-2 w-48" id="baseFunctionalComponentClass" value={calculationData.baseFunctionalComponentClass} onChange={handleBaseFunctionalComponentClass}>
            {/* Dynamically render options for base functional component class */}
            {baseFunctionalComponentClasses.map((componentClass, index) => {
              return <option key={index} value={componentClass}>{componentClass}</option>
            })}
          </select>
        </div>

        <div className="flex flex-col gap-5 items-center">
          <label htmlFor="baseFunctionalComponentType">Base Functional Component Type</label>
          <select className="border-2 rounded-2xl px-4 py-2 w-48" id="baseFunctionalComponentType" value={calculationData.baseFunctionalComponentType} onChange={handleChange}>
            {/* Dynamically render base functional component types depending on selected class */}
            {/* Using type assertion because TypeScript doesn't know if baseFunctionalComponentTypes has a key matching calculationData.baseFunctionalComponentClass */}
            {baseFunctionalComponentTypes[calculationData.baseFunctionalComponentClass as keyof ComponentTypes].map((componentType, index) => {
              return <option key={index} value={componentType}>{componentType}</option>
            })}
          </select>
        </div>

        <div className="flex flex-col gap-5 items-center">
          <label htmlFor="dataElements">Data elements</label>
          <input
            className="border-2 rounded-2xl px-4 py-2 w-48"
            type="number"
            id="dataElements"
            value={calculationData.dataElements}
            onChange={handleChange}
          />
        </div>

        <div className="flex flex-col gap-5 items-center">
          <label htmlFor="readingReferences">Reading References</label>
          <input
            className="border-2 rounded-2xl px-4 py-2 w-48"
            type="number"
            id="readingReferences"
            value={calculationData.readingReferences}
            onChange={handleChange}
          />
        </div>

        <div className="flex flex-col gap-5 items-center">
          <label htmlFor="writingReferences">Writing References</label>
          <input
            className="border-2 rounded-2xl px-4 py-2 w-48"
            type="number"
            id="writingReferences"
            value={calculationData.writingReferences}
            onChange={handleChange}
          />
        </div>

        <div className="flex flex-col gap-5 items-center">
          <label htmlFor="functionalityMultiplier">Functionality Multiplier</label>
          <input
            className="border-2 rounded-2xl px-4 py-2 w-48"
            type="number"
            id="functionalityMultiplier"
            value={calculationData.functionalityMultiplier}
            onChange={handleChange}
          />
        </div>
      </div>

      <button className="border-2 py-2 px-2 bg-gray-500 text-white cursor-pointer" type="submit">Calculate Functional Points</button>
      <div>Result: {result}</div>
    </form>
  )
}

export default CalculationDemo