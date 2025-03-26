import { Project, TGenericComponent } from '../lib/types';
import { getCalculateFuntion, getComponentTypeOptions } from '../lib/fc-service-functions';
import { downloadProjectComponentsCsv, createPdf } from '../lib/printUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { classNameOptions } from '../lib/fc-constants';
import useLanguage from '../hooks/useLanguage';
import { translations } from '../lib/translations';

type FunctionalClassComponentProps = {
  project: Project;
};

type GenericComponentWithCount = TGenericComponent & { count: number, points: number }

const getClassDisplayName = (component: TGenericComponent) => classNameOptions.find(option => option.value === component.className)?.displayName
const getComponentTypeDisplayName = (component: TGenericComponent) => {
  if (!component.className) return null;
  return getComponentTypeOptions(component.className).find(option => option.value === component.componentType)?.displayName
}

const calculateFunctionalComponentPoints = (component: TGenericComponent) => {
  if (!component.className || !component.componentType) return 0
  const calculateFunction = getCalculateFuntion(component.className);
  //@ts-expect-error(TODO - component should be typed before it goes to the calculation)
  return calculateFunction ? calculateFunction(component) : 0;
};

const calculateTotalFunctionalComponentPoints = (components: TGenericComponent[]) => {
  let totalPoints = 0;
  for (const component of components) {
    totalPoints += calculateFunctionalComponentPoints(component);
  }
  return totalPoints;
};

const getGroupedFunctionalComponents = (components: TGenericComponent[]) => {
  const grouped: GenericComponentWithCount[] = []
  for (const component of components) {
    const existingIndex = grouped.findIndex(({ className, componentType }) => component.className === className && component.componentType === componentType)
    if (existingIndex === -1) {
      grouped.push({ ...component, count: 1, points: calculateFunctionalComponentPoints(component) })
    } else {
      grouped[existingIndex].count += 1
      grouped[existingIndex].points += calculateFunctionalComponentPoints(component)
    }
  }
  return grouped;
}

export const FunctionalPointSummary = ({ project }: FunctionalClassComponentProps) => {
  const totalPoints = calculateTotalFunctionalComponentPoints(project.functionalComponents);
  const { language } = useLanguage();

  const translation = translations[language].functionalPointSummary;

  return (
    <div className="flex flex-col gap-3 border-2 my-5 p-4 sticky top-60">
      <div>
        {getGroupedFunctionalComponents(project.functionalComponents).map((component) => {

          return (
            <div key={component.id} className="flex gap-5 justify-between w-full pb-3">
              <div>
                {component.count + "x "}
                {getClassDisplayName(component)}
                <br />
                {getComponentTypeDisplayName(component)}
              </div>
              <div>
                {component.points.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-7 justify-between w-full border-t pt-4">
        <b>
          {translation.total}
        </b>
        <b>
          {totalPoints.toFixed(2)} {translation.functionalPointText}
        </b>
      </div>

      <button
        onClick={() => downloadProjectComponentsCsv(project)}
        className="mt-3 px-4 py-2 bg-fisma-blue hover:bg-fisma-gray text-white rounded-lg cursor-pointer">
        {translation.csv} <FontAwesomeIcon icon={faDownload} />
      </button>
      <button
        onClick={() => createPdf(project)}
        className="mt-3 px-4 py-2 bg-fisma-blue hover:bg-fisma-gray text-white rounded-lg cursor-pointer">
        {translation.pdf} <FontAwesomeIcon icon={faDownload} />
      </button>
    </div>
  );
};