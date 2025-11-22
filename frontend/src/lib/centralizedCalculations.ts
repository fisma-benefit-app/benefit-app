import { TGenericComponent, Project } from "./types";
import { getCalculateFunction } from "./fc-service-functions";

// Memoization cache for expensive calculations
const calculationCache = new Map<string, number>();

/**
 * Generates a cache key for memoization
 */
const generateCacheKey = (component: TGenericComponent): string => {
  return [
    component.id ?? "",
    component.className ?? "",
    component.componentType ?? "",
    Array.isArray(component.dataElements)
      ? component.dataElements.join(",")
      : (component.dataElements ?? ""),
    Array.isArray(component.readingReferences)
      ? component.readingReferences.join(",")
      : (component.readingReferences ?? ""),
    Array.isArray(component.writingReferences)
      ? component.writingReferences.join(",")
      : (component.writingReferences ?? ""),
    Array.isArray(component.operations)
      ? component.operations.join(",")
      : (component.operations ?? ""),
    component.degreeOfCompletion ?? "",
  ].join("|");
};

/**
 * Calculate base functional points for a component (without degree of completion)
 * Uses memoization for performance optimization
 */
export const calculateBasePoints = (component: TGenericComponent): number => {
  if (!component.className) {
    return 0;
  }

  const cacheKey = `base-${generateCacheKey(component)}`;

  if (calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey)!;
  }

  const calculateFunction = getCalculateFunction(component.className);
  const basePoints = calculateFunction ? calculateFunction(component) : 0;

  calculationCache.set(cacheKey, basePoints);
  return basePoints;
};

/**
 * Calculate functional points for a component including degree of completion
 * Uses memoization for performance optimization
 */
export const calculateComponentPoints = (
  component: TGenericComponent,
): number => {
  const cacheKey = `component-${generateCacheKey(component)}`;

  if (calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey)!;
  }

  const basePoints = calculateBasePoints(component);
  const degreeOfCompletion = component.degreeOfCompletion || 0;
  const totalPoints = basePoints * degreeOfCompletion;

  calculationCache.set(cacheKey, totalPoints);
  return totalPoints;
};

/**
 * Calculate functional points for a component with a custom multiplier
 * Used primarily in print utilities
 */
export const calculateComponentPointsWithMultiplier = (
  component: TGenericComponent | null,
  multiplier: number | null,
): number => {
  if (!component) return 0;

  const basePoints = calculateBasePoints(component);
  return multiplier != null ? basePoints * multiplier : basePoints;
};

// Helper: Order-independent hash for array of strings
function hashComponentKeys(keys: string[]): string {
  // Simple commutative hash: XOR of string hashes
  let hash = 0;
  for (const key of keys) {
    let strHash = 0;
    for (let i = 0; i < key.length; i++) {
      strHash = (strHash << 5) - strHash + key.charCodeAt(i);
      strHash |= 0; // Convert to 32bit integer
    }
    hash ^= strHash;
  }
  return hash.toString(16);
}

/**
 * Calculate total functional points for an array of components
 * Uses memoization and optimized iteration
 */
export const calculateTotalPoints = (
  components: TGenericComponent[],
): number => {
  if (components.length === 0) return 0;

  // Create a cache key based on component IDs and their essential properties
  const componentKeys = components.map((c) => generateCacheKey(c));
  const hash = hashComponentKeys(componentKeys);
  const totalCacheKey = `total-${hash}`;

  if (calculationCache.has(totalCacheKey)) {
    return calculationCache.get(totalCacheKey)!;
  }

  let totalPoints = 0;
  for (const component of components) {
    totalPoints += calculateComponentPoints(component);
  }

  calculationCache.set(totalCacheKey, totalPoints);
  return totalPoints;
};

/**
 * Calculate total functional points for a project
 */
export const calculateProjectTotalPoints = (project: Project): number => {
  return calculateTotalPoints(project.functionalComponents);
};

/**
 * Calculate total possible functional points for components (if all were 100% complete)
 * Uses memoization for performance optimization
 */
export const calculateTotalPossiblePoints = (
  components: TGenericComponent[],
): number => {
  if (components.length === 0) return 0;

  // Create a cache key based on component properties using generateCacheKey (excluding degreeOfCompletion)
  const componentKeys = components
    .map((c) => {
      // Clone component with degreeOfCompletion set to null to exclude it from the key
      const { degreeOfCompletion, ...rest } = c;
      return generateCacheKey({ ...rest, degreeOfCompletion: null });
    })
    .sort()
    .join("|");
  const totalPossibleCacheKey = `total-possible-${componentKeys}`;

  if (calculationCache.has(totalPossibleCacheKey)) {
    return calculationCache.get(totalPossibleCacheKey)!;
  }

  let totalPossiblePoints = 0;
  for (const component of components) {
    totalPossiblePoints += calculateBasePoints(component);
  }

  calculationCache.set(totalPossibleCacheKey, totalPossiblePoints);
  return totalPossiblePoints;
};

/**
 * Calculate total possible functional points for a project (if all components were 100% complete)
 */
export const calculateProjectTotalPossiblePoints = (
  project: Project,
): number => {
  return calculateTotalPossiblePoints(project.functionalComponents);
};

/**
 * Get unique class names from components
 * Optimized with Set for better performance
 */
export const getUniqueClassNames = (
  components: TGenericComponent[],
): string[] => {
  const uniqueClasses = new Set<string>();

  for (const component of components) {
    if (component.className) {
      uniqueClasses.add(component.className);
    }
  }

  return Array.from(uniqueClasses);
};

/**
 * Get unique component types from components
 * Optimized with Set for better performance
 */
export const getUniqueComponentTypes = (
  components: TGenericComponent[],
): string[] => {
  const uniqueTypes = new Set<string>();

  for (const component of components) {
    if (component.componentType) {
      uniqueTypes.add(component.componentType);
    }
  }

  return Array.from(uniqueTypes);
};

/**
 * Group components by class name and component type for summary displays
 */
export const getGroupedComponents = (components: TGenericComponent[]) => {
  const uniqueClasses = getUniqueClassNames(components);

  return uniqueClasses.map((className) => {
    const componentsInClass = components.filter(
      (component) => component.className === className,
    );

    const uniqueTypes = getUniqueComponentTypes(componentsInClass);

    const typesInClass = uniqueTypes.map((componentType) => {
      const componentsOfType = componentsInClass.filter(
        (component) => component.componentType === componentType,
      );

      return {
        type: componentType || null,
        count: componentsOfType.length,
        points: calculateTotalPoints(componentsOfType),
      };
    });

    const componentsWithoutType = componentsInClass.filter(
      (component) => !component.componentType,
    );
    if (componentsWithoutType.length > 0) {
      typesInClass.push({
        type: null,
        count: componentsWithoutType.length,
        points: calculateTotalPoints(componentsWithoutType),
      });
    }

    return { className, components: typesInClass };
  });
};

/**
 * Clear calculation cache - useful when components are updated
 */
export const clearCalculationCache = (): void => {
  calculationCache.clear();
};

/**
 * Get cache size for debugging/monitoring purposes
 */
export const getCacheSize = (): number => {
  return calculationCache.size;
};

/**
 * Calculate points for components with enhanced CSV export data
 */
export const calculateComponentsWithPoints = (
  components: TGenericComponent[],
) => {
  return components.map((component) => ({
    ...component,
    functionalPoints: calculateComponentPoints(component).toFixed(2),
  }));
};

/**
 * Batch calculate multiple component points efficiently
 * Useful for bulk operations
 */
export const batchCalculateComponentPoints = (
  components: TGenericComponent[],
): number[] => {
  return components.map(calculateComponentPoints);
};

/**
 * Check if component has valid calculation parameters
 */
export const hasValidCalculationParams = (
  component: TGenericComponent,
): boolean => {
  /**
   * Only "Interactive end-user input service" requires componentType for calculation.
   * All other classes only require className.
   */
  return component.className === "Interactive end-user input service"
    ? !!(component.className && component.componentType)
    : !!component.className;
};

/**
 * Get components that are ready for calculation (have required fields)
 */
export const getCalculableComponents = (
  components: TGenericComponent[],
): TGenericComponent[] => {
  return components.filter(hasValidCalculationParams);
};

/**
 * Get components that are missing calculation parameters
 */
export const getIncompleteComponents = (
  components: TGenericComponent[],
): TGenericComponent[] => {
  return components.filter(
    (component) => !hasValidCalculationParams(component),
  );
};

export const calculateReferencesSum = (
  parentComponent: TGenericComponent,
): number => {
  return (
    Number(parentComponent.readingReferences ?? 0) +
    Number(parentComponent.writingReferences ?? 0)
  );
};
