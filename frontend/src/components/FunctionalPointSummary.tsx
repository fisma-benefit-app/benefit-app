import { Project, TGenericComponent, ClassName, ComponentType } from '../lib/types';
import { getCalculateFuntion} from '../lib/fc-service-functions';
import { downloadProjectComponentsCsv, createPdf } from '../lib/printUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import useTranslations from '../hooks/useTranslations.ts';

type FunctionalClassComponentProps = {
  project: Project;
};

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

const getUniqueClasses = (components: TGenericComponent[]) => components.reduce<string[]>((acc, curr) => !curr.className || acc.some(x => x === curr.className) ? acc : [...acc, curr.className], [])

const getUniqueTypes = (components: TGenericComponent[]) => components.reduce<string[]>((acc, curr) => !curr.componentType || acc.some(x => x === curr.componentType) ? acc : [...acc, curr.componentType], [])

const getGroupedFunctionalComponents = (components: TGenericComponent[]) => {
  const grouped = getUniqueClasses(components).map(className => {
    const componentTypeInThisClass = components.filter(component => component.className === className)

    const uniqueTypes = getUniqueTypes(componentTypeInThisClass)

    const typesInThisClass = uniqueTypes.map<{ count: number, points: number, type: string }>(
      componentType => {
        const componentsOfThisType = componentTypeInThisClass.filter(component => component.componentType === componentType)

        return (
          {
            type: componentType,
            count: componentsOfThisType.length,
            points: calculateTotalFunctionalComponentPoints(componentsOfThisType)
          }
        )
      }
    )

    return ({ className, components: typesInThisClass })
  })

  return grouped;
}

export const FunctionalPointSummary = ({ project }: FunctionalClassComponentProps) => {

  const translation = useTranslations();

  const totalPoints = calculateTotalFunctionalComponentPoints(project.functionalComponents);
  return (
    <div className="flex flex-col border-2 p-4 sticky top-60 bg-white">
      <div className="max-h-[60vh]">
        {getGroupedFunctionalComponents(project.functionalComponents).map((group) => {
          const componentCount = group.components.reduce((acc, curr) => acc + curr.count, 0)
          const totalPoints = group.components.reduce((acc, curr) => acc + curr.points, 0)
  
          return (
            <div key={group.className} className="flex gap-2 sm:gap-5 justify-between w-full pb-3 text-sm sm:text-base">
              <div>
                <b>
                  {componentCount + "x "}
                  {translation.functionalClassComponent.classNameOptions[group.className as ClassName]} { }
                </b>
                <br />
                {group.components.map((groupedTypes, idx) => (
                  <div key={idx}>
                    {groupedTypes.count}x {translation.functionalClassComponent.componentTypeOptions[groupedTypes.type as ComponentType]} {groupedTypes.points.toFixed(2)}
                  </div>
                ))}
              </div>
              <div className="font-semibold">
                {totalPoints.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
  
      <div className="flex gap-5 justify-between w-full border-t pt-4 text-sm sm:text-base">
        <b>
          {translation.functionalPointSummary.total}
        </b>
        <b>
          {totalPoints.toFixed(2)} {translation.functionalPointSummary.functionalPointText}
        </b>
      </div>
  
      <div className="flex flex-row gap-2 mt-3 justify-center">
        <button
          onClick={() => downloadProjectComponentsCsv(project)}
          className="px-4 py-2 bg-fisma-blue hover:bg-fisma-dark-blue text-white cursor-pointer text-sm sm:text-base"
        >
          CSV <FontAwesomeIcon icon={faDownload} />
        </button>
        <button
          onClick={() => createPdf(project)}
          className="px-4 py-2 bg-fisma-blue hover:bg-fisma-dark-blue text-white cursor-pointer text-sm sm:text-base"
        >
          PDF <FontAwesomeIcon icon={faDownload} />
        </button>
      </div>
    </div>
  );
};