import { ChangeEvent, FormEvent, useState } from "react"
import { baseFunctionalComponentClasses, baseFunctionalComponentTypes, ComponentTypes, componentClassInputs } from "./classesAndTypes"
import {
  calculateInteractiveEndUserNavigationAndQueryService,
  calculateInteractiveEndUserInputService,
  calculateNonInteractiveEndUserOutputService,
  calculateInterfaceServiceToOtherApplications,
  calculateInterfaceServiceFromOtherApplications,
  calculateDataStorageService,
  calculateAlgorithmicOrManipulationService
} from "./calculations"

const CalculationDemoConditionalRendering = () => {

  //TODO: maybe finnish language in the ui for this demo, refactoring as issues are noticed, implement calculation logic based on collected info

  //define type for collected form data and the state where the data is stored
  type CalculationData = {
    baseFunctionalComponentClass: string,
    baseFunctionalComponentType: string,
    dataElements: number,
    readingReferences: number,
    writingReferences: number,
    functionalityMultiplier: number,
    operations: number
  }

  //state where collected form data is stored
  const [calculationData, setCalculationData] = useState<CalculationData>({
    baseFunctionalComponentClass: "Interactive end-user navigation and query service",
    baseFunctionalComponentType: "function designators",
    dataElements: 1,
    readingReferences: 1,
    writingReferences: 1,
    functionalityMultiplier: 1,
    operations: 1
  })

  //state for storing and rendering calculated result
  const [result, setResult] = useState<number>(0);

  //handles state update for baseFunctionalComponentClass, and also updates baseFunctionalComponentType in the state accordingly since available types change based on class
  //Using type assertion because TypeScript doesn't know if baseFunctionalComponentTypes has a key matching e.target.value
  const handleBaseFunctionalComponentClass = (e: ChangeEvent<HTMLSelectElement>) => {
    setCalculationData({ ...calculationData, baseFunctionalComponentClass: e.target.value, baseFunctionalComponentType: baseFunctionalComponentTypes[e.target.value as keyof ComponentTypes][0].value });
  }

  //update state based on user input
  const handleChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setCalculationData({ ...calculationData, [e.target.id]: e.target.value });
  }

  //TODO: implement calculation logic here
  const calculateFunctionalPoints = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(calculationData)

    const {
      baseFunctionalComponentClass,
      baseFunctionalComponentType,
      dataElements,
      readingReferences,
      writingReferences,
      operations
    } = calculationData

    let result: number;

    switch (baseFunctionalComponentClass) {
      case "Interactive end-user navigation and query service":
        result = calculateInteractiveEndUserNavigationAndQueryService(baseFunctionalComponentType, dataElements, readingReferences);
        break;
      case "Interactive end-user input service":
        result = calculateInteractiveEndUserInputService(baseFunctionalComponentType, dataElements, writingReferences, readingReferences);
        break;
      case "Non-interactive end-user output service":
        result = calculateNonInteractiveEndUserOutputService(dataElements, readingReferences);
        break;
      case "Interface service to other applications":
        result = calculateInterfaceServiceToOtherApplications(dataElements, readingReferences);
        break;
      case "Interface service from other applications":
        result = calculateInterfaceServiceFromOtherApplications(dataElements, writingReferences, readingReferences);
        break;
      case "Data storage service":
        result = calculateDataStorageService(dataElements);
        break;
      case "Algorithmic or manipulation service":
        result = calculateAlgorithmicOrManipulationService(dataElements, operations);
        break;
      default:
        throw new Error("Unknown component class selected!");
    }

    setResult(result);
  }

  return (
    //form for collecting calculation data
    <form onSubmit={calculateFunctionalPoints} className='flex flex-col gap-10 items-center flex-wrap'>
      <div className="flex gap-10 justify-center flex-wrap">
        <div className="flex flex-col gap-5 items-center">
          <label htmlFor="baseFunctionalComponentClass">Toimintoluokka</label>
          <select className="border-2 rounded-2xl px-4 py-2 w-48" id="baseFunctionalComponentClass" value={calculationData.baseFunctionalComponentClass} onChange={handleBaseFunctionalComponentClass}>
            {/* Dynamically render options for base functional component class */}
            {baseFunctionalComponentClasses.map((componentClass, index) => {
              return <option key={index} value={componentClass.value}>{componentClass.displayName}</option>
            })}
          </select>
        </div>

        <div className="flex flex-col gap-5 items-center">
          <label htmlFor="baseFunctionalComponentType">Toimintotyyppi</label>
          <select className="border-2 rounded-2xl px-4 py-2 w-48" id="baseFunctionalComponentType" value={calculationData.baseFunctionalComponentType} onChange={handleChange}>
            {/* Dynamically render base functional component types depending on selected class */}
            {/* Using type assertion because TypeScript doesn't know if baseFunctionalComponentTypes has a key matching calculationData.baseFunctionalComponentClass */}
            {baseFunctionalComponentTypes[calculationData.baseFunctionalComponentClass as keyof ComponentTypes].map((componentType, index) => {
              return <option key={index} value={componentType.value}>{componentType.displayName}</option>
            })}
          </select>
        </div>

        {/* Dynamically render only relevant input fields depending on selected component class */}
        {componentClassInputs.filter(input => input.componentClasses.includes(calculationData.baseFunctionalComponentClass)).map((input, index) => {
          return (
            <div key={index} className="flex flex-col gap-5 items-center">
              <label htmlFor={input.inputName}>{input.displayName}</label>
              <input
                className="border-2 rounded-2xl px-4 py-2 w-48"
                type="number"
                id={input.inputName}
                value={calculationData[input.inputName as keyof CalculationData]}
                onChange={handleChange}
              />
            </div>
          )
        })}
      </div>

      <button className="border-2 py-2 px-2 bg-gray-500 text-white cursor-pointer" type="submit">Laske pisteet</button>
      <div>Tulos: {result}</div>
    </form>
  )
}



export default CalculationDemoConditionalRendering