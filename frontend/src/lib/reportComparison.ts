import { calculateComponentPointsWithMultiplier } from "./centralizedCalculations";
import { MLAsubComponent, Project, TGenericComponent } from "./types";

export type CellValue = string | number | null | undefined;

// A value is highlighted when it differs from the previous version's. Nothing is highlighted in
// version 1, which has nothing to compare with.
export const isChanged = (
  current: CellValue,
  prev: CellValue,
  isFirstVersion: boolean,
) => !isFirstVersion && prev !== current;

// Points as shown in the report, rounded to two decimals. The same function must be used for the
// current and the previous component: a degree of completion of 0 has to give 0.00 on both sides
// (a falsy check would turn it into "no multiplier" and make an unchanged 0.00 look changed).
export const componentPointsText = (
  component: TGenericComponent | null,
): string =>
  calculateComponentPointsWithMultiplier(
    component,
    component?.degreeOfCompletion ?? null,
  ).toFixed(2);

// Previous version's components by ID, including MLA subcomponents, which the API nests under
// their parent rather than listing at the top level.
export const buildPreviousComponentsMap = (
  previousProject: Project,
): Record<number, TGenericComponent> =>
  Object.fromEntries(
    previousProject.functionalComponents.flatMap((component) => [
      [component.id, component],
      ...(component.subComponents ?? []).map((sub) => [sub.id, sub]),
    ]),
  );

// Editing a parent regenerates its subcomponents without previousFCId, so those are matched to
// the previous parent's subcomponent of the same kind instead.
export const findPreviousSubComponent = (
  sub: MLAsubComponent,
  previousParent: TGenericComponent | null,
  previousComponentsMap: Record<number, TGenericComponent>,
): TGenericComponent | null => {
  if (sub.previousFCId) return previousComponentsMap[sub.previousFCId] ?? null;
  const match = previousParent?.subComponents?.find(
    (previousSub) =>
      previousSub.subComponentType === sub.subComponentType &&
      previousSub.className === sub.className,
  );
  return match ?? null;
};
