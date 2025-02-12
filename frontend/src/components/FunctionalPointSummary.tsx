import { TGenericComponent } from '../lib/types';
import { getCalculateFuntion } from '../lib/fc-service-functions';

type FunctionalClassComponentProps = {
  functionalComponents: TGenericComponent[];
};

const calculateFunctionalComponentPoints = (component: TGenericComponent) => {
  const calculateFunction = getCalculateFuntion((component.className && component.componentType) ? component.className : "");
  //@ts-expect-error(TODO - component should be typed before it goes to the calculation)
  return calculateFunction ? calculateFunction(component) : 0;
}

const calculateTotalFunctionalComponentPoints = (components: TGenericComponent[]) => {
  let totalPoints = 0;
  for (const x of components) {
    totalPoints += calculateFunctionalComponentPoints(x)
  }
  return totalPoints;
}
export const FunctionalPointSummary = ({ functionalComponents }: FunctionalClassComponentProps) => {
  console.log(functionalComponents)
  return (
    <div className="flex flex-col gap-3 border-2 bg-[#fafaf5] my-5 rounded-2xl p-4 sticky top-20">
      Yhteenveto
      <div className="flex flex-col">
        {functionalComponents.map((component, i) => {
          return (
            <div className="flex justify-between w-full">
              <div>
                {i + 1}
              </div>
              <div>
                {calculateFunctionalComponentPoints(component)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between w-full">
        <div>
          Yhteensä
        </div>
        <div>
          {calculateTotalFunctionalComponentPoints(functionalComponents)}
        </div>
      </div>
    </div>
  )
}
