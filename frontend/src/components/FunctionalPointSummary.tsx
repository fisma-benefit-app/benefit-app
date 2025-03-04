import { Project, TGenericComponent } from '../lib/types';
import { getCalculateFuntion } from '../lib/fc-service-functions';
import { downloadProjectComponentsCsv } from '../lib/csvUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

type FunctionalClassComponentProps = {
  project: Project;
};

const calculateFunctionalComponentPoints = (component: TGenericComponent) => {
  const calculateFunction = getCalculateFuntion((component.className && component.componentType) ? component.className : "");
  //@ts-expect-error(TODO - component should be typed before it goes to the calculation)
  return calculateFunction ? calculateFunction(component) : 0;
};

const calculateTotalFunctionalComponentPoints = (components: TGenericComponent[]) => {
  let totalPoints = 0;
  for (const x of components) {
    totalPoints += calculateFunctionalComponentPoints(x);
  }
  return totalPoints;
};

export const FunctionalPointSummary = ({ project}: FunctionalClassComponentProps) => {

  return (
    <div className="flex flex-col gap-3 border-2 my-5 p-4 sticky top-60">
      Yhteenveto
      <div className="flex flex-col">
        {project.functionalComponents.map((component, i) => {
          return (
            <div key={i} className="flex justify-center gap-15 w-full">
              <div>
                {i + 1}.
              </div>
              <div>
                {calculateFunctionalComponentPoints(component)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center w-full gap-5">
        <div>
          Yhteensä
        </div>
        <div>
          {calculateTotalFunctionalComponentPoints(project.functionalComponents)}
        </div>
      </div>
      <button 
        onClick={() => downloadProjectComponentsCsv(project.id)}
        className="mt-3 px-4 py-2 bg-fisma-blue hover:bg-fisma-gray text-white rounded-lg cursor-pointer">
        CSV <FontAwesomeIcon icon={faDownload}/>
      </button>
    </div>
  );
};