import { Project, TGenericComponent } from '../lib/types';
import { getCalculateFuntion } from '../lib/fc-service-functions';
import { downloadProjectComponentsCsv, createPdf } from '../lib/printUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { classNameOptions } from '../lib/fc-constants';

type FunctionalClassComponentProps = {
  project: Project;
};

const getClassDisplayName = (value: string | null) => classNameOptions.find(option => value === option.value)?.displayName

const calculateFunctionalComponentPoints = (component: TGenericComponent) => {
  if (!component.className || !component.componentType) return 0
  const calculateFunction = getCalculateFuntion(component.className);
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

export const FunctionalPointSummary = ({ project }: FunctionalClassComponentProps) => {
  const totalPoints = calculateTotalFunctionalComponentPoints(project.functionalComponents);
  return (
    <div className="flex flex-col gap-3 border-2 my-5 p-4 sticky top-60">
      <div>
        {project.functionalComponents.map((component, i) => {
          const points = calculateFunctionalComponentPoints(component);

          return (
            <div key={i} className="flex gap-7 justify-between w-full">
              <div>
                {getClassDisplayName(component.className)}
              </div>
              <div>
                {points.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-7 justify-between w-full border-t pt-4">
        <b>
          Yhteensä
        </b>
        <b>
          {totalPoints.toFixed(2)} TP
        </b>
      </div>

      <button
        onClick={() => downloadProjectComponentsCsv(project)}
        className="mt-3 px-4 py-2 bg-fisma-blue hover:bg-fisma-gray text-white rounded-lg cursor-pointer">
        CSV <FontAwesomeIcon icon={faDownload} />
      </button>
      <button
        onClick={() => createPdf(project)}
        className="mt-3 px-4 py-2 bg-fisma-blue hover:bg-fisma-gray text-white rounded-lg cursor-pointer">
        PDF <FontAwesomeIcon icon={faDownload} />
      </button>
    </div>
  );
};