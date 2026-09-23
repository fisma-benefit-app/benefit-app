import { TGenericComponent, Project } from "./types";
import { getCalculateFunction } from "./fc-service-functions";

/**
 * Calculate base functional points for a component (without degree of completion)
 */
export const calculateBasePoints = (component: TGenericComponent): number => {
  if (!component.className) {
    return 0;
  }

  const calculateFunction = getCalculateFunction(component.className);
  return calculateFunction ? calculateFunction(component) : 0;
};

/**
 * Calculate functional points for a component including degree of completion
 */
export const calculateComponentPoints = (
  component: TGenericComponent,
): number => {
  const basePoints = calculateBasePoints(component);
  const degreeOfCompletion = component.degreeOfCompletion || 0;
  return basePoints * degreeOfCompletion;
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

/**
 * Calculate functional points grouped by layer (UI, Business, Database)
 * Based on component subComponentType
 */
export const calculatePointsByLayer = (
  components: TGenericComponent[],
): { userInterface: number; business: number; database: number } => {
  const totalPoints = {
    userInterface: 0,
    business: 0,
    database: 0,
  };

  for (const component of components) {
    const componentPoints = calculateComponentPoints(component); // Calculate main component points

    // If component is one of these classes, assign points directly to business layer
    if (
      component.className === "Non-interactive end-user output service" ||
      component.className === "Interface service to other applications" ||
      component.className === "Interface service from other applications" ||
      component.className === "Algorithmic or manipulation service"
    ) {
      totalPoints.business += componentPoints;
    } else if (component.className === "Data storage service") {
      totalPoints.database += componentPoints;
    } else {
      // Default assignment to UI layer for other classes
      totalPoints.userInterface += componentPoints;
    }

    // Loop through subcomponents to assign points by layer
    if (component.subComponents && component.subComponents.length > 0) {
      for (const subComponent of component.subComponents) {
        const subType = subComponent.subComponentType ?? "";

        // Calculate subcomponent points
        const subComponentPoints = calculateComponentPoints(
          subComponent as TGenericComponent,
        );

        // Calculate total points by layer
        if (subType.startsWith("B-")) {
          totalPoints.business += subComponentPoints;
        } else if (subType.startsWith("UI-")) {
          totalPoints.userInterface += subComponentPoints;
        } else if (subType.startsWith("D-")) {
          totalPoints.database += subComponentPoints;
        } else {
          // Default to UI layer if no subtype match
          totalPoints.userInterface += subComponentPoints;
        }
      }
    }
  }

  return totalPoints;
};

/**
 * Calculate layer points for a project
 */
export const calculateProjectPointsByLayer = (
  project: Project,
): { userInterface: number; business: number; database: number } => {
  return calculatePointsByLayer(project.functionalComponents);
};

/**
 * Calculate possible functional points grouped by layer (UI, Business, Database)
 * Same logic as calculatePointsByLayer but uses base points (without degree of completion)
 */
export const calculatePossiblePointsByLayer = (
  components: TGenericComponent[],
): { userInterface: number; business: number; database: number } => {
  const totalPossiblePoints = {
    userInterface: 0,
    business: 0,
    database: 0,
  };

  for (const component of components) {
    const componentBasePoints = calculateBasePoints(component); // Calculate main component base points

    // If component is one of these classes, assign points directly to business layer
    if (
      component.className === "Non-interactive end-user output service" ||
      component.className === "Interface service to other applications" ||
      component.className === "Interface service from other applications" ||
      component.className === "Algorithmic or manipulation service"
    ) {
      totalPossiblePoints.business += componentBasePoints;
    } else if (component.className === "Data storage service") {
      totalPossiblePoints.database += componentBasePoints;
    } else {
      // Default assignment to UI layer for other classes
      totalPossiblePoints.userInterface += componentBasePoints;
    }

    // Loop through subcomponents to assign points by layer
    if (component.subComponents && component.subComponents.length > 0) {
      for (const subComponent of component.subComponents) {
        const subType = subComponent.subComponentType ?? "";

        // Calculate subcomponent base points
        const subComponentBasePoints = calculateBasePoints(
          subComponent as TGenericComponent,
        );

        // Calculate total possible points by layer
        if (subType.startsWith("B-")) {
          totalPossiblePoints.business += subComponentBasePoints;
        } else if (subType.startsWith("UI-")) {
          totalPossiblePoints.userInterface += subComponentBasePoints;
        } else if (subType.startsWith("D-")) {
          totalPossiblePoints.database += subComponentBasePoints;
        } else {
          // Default to UI layer if no subtype match
          totalPossiblePoints.userInterface += subComponentBasePoints;
        }
      }
    }
  }

  return totalPossiblePoints;
};

/**
 * Calculate total functional points for an array of components
 */
export const calculateTotalPoints = (
  components: TGenericComponent[],
): number => {
  let totalPoints = 0;
  for (const component of components) {
    totalPoints += calculateComponentPoints(component);
  }
  return totalPoints;
};

/**
 * Calculate total functional points for a project
 */
export const calculateProjectTotalPoints = (project: Project): number => {
  return calculateTotalPoints(project.functionalComponents);
};

/**
 * Calculate total functional points for parent components only (excluding subcomponents)
 */
export const calculateParentOnlyPoints = (
  components: TGenericComponent[],
): number => {
  if (components.length === 0) return 0;

  let totalPoints = 0;
  for (const component of components) {
    totalPoints += calculateComponentPoints(component);
  }

  return totalPoints;
};

/**
 * Calculate total possible functional points for parent components only (excluding subcomponents)
 */
export const calculateParentOnlyPossiblePoints = (
  components: TGenericComponent[],
): number => {
  if (components.length === 0) return 0;

  let totalPossiblePoints = 0;
  for (const component of components) {
    totalPossiblePoints += calculateBasePoints(component);
  }

  return totalPossiblePoints;
};

/**
 * Calculate grand total including all subcomponents
 */
export const calculateGrandTotalPoints = (
  components: TGenericComponent[],
): number => {
  if (components.length === 0) return 0;

  let totalPoints = 0;
  for (const component of components) {
    totalPoints += calculateComponentPoints(component);

    // Add subcomponents
    if (component.subComponents && component.subComponents.length > 0) {
      for (const subComponent of component.subComponents) {
        totalPoints += calculateComponentPoints(
          subComponent as TGenericComponent,
        );
      }
    }
  }

  return totalPoints;
};

/**
 * Calculate grand total possible points including all subcomponents
 */
export const calculateGrandTotalPossiblePoints = (
  components: TGenericComponent[],
): number => {
  if (components.length === 0) return 0;

  let totalPossiblePoints = 0;
  for (const component of components) {
    totalPossiblePoints += calculateBasePoints(component);

    // Add subcomponents
    if (component.subComponents && component.subComponents.length > 0) {
      for (const subComponent of component.subComponents) {
        totalPossiblePoints += calculateBasePoints(
          subComponent as TGenericComponent,
        );
      }
    }
  }

  return totalPossiblePoints;
};

/**
 * Calculate total possible functional points for components (if all were 100% complete)
 */
export const calculateTotalPossiblePoints = (
  components: TGenericComponent[],
): number => {
  let totalPossiblePoints = 0;
  for (const component of components) {
    totalPossiblePoints += calculateBasePoints(component);
  }
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
 * Separates parent components and subcomponents
 */
export const getGroupedComponents = (components: TGenericComponent[]) => {
  // Separate parent components and subcomponents
  const parentComponents: TGenericComponent[] = [];
  const subComponents: TGenericComponent[] = [];

  components.forEach((component) => {
    parentComponents.push(component);
    if (component.subComponents && component.subComponents.length > 0) {
      component.subComponents.forEach((subComponent) => {
        subComponents.push(subComponent as TGenericComponent);
      });
    }
  });

  const groupByClassAndType = (componentsList: TGenericComponent[]) => {
    const uniqueClasses = getUniqueClassNames(componentsList);

    return uniqueClasses.map((className) => {
      const componentsInClass = componentsList.filter(
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

  return {
    parentGroups: groupByClassAndType(parentComponents),
    subComponentGroups: groupByClassAndType(subComponents),
  };
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
    subComponents: component.subComponents
      ? component.subComponents.map((sub) => ({
          ...sub,
          functionalPoints: calculateComponentPoints(
            sub as TGenericComponent,
          ).toFixed(2),
        }))
      : component.subComponents,
  }));
};

export const calculateReferencesSum = (
  parentComponent: TGenericComponent,
): number => {
  return (
    Number(parentComponent.readingReferences ?? 0) +
    Number(parentComponent.writingReferences ?? 0)
  );
};

/**
 * Calculate MLA layer details with component count and functional points
 * Uses the existing calculatePointsByLayer logic and adds component counting
 *
 * Layer assignment rules:
 * - UI layer: All parent components + subcomponents with subtype starting with "UI-"
 * - Business layer: Subcomponents with subtype starting with "B-"
 * - Data layer: Subcomponents with subtype starting with "D-"
 */
export const calculateMLALayerDetails = (
  components: TGenericComponent[],
): {
  ui: { count: number; points: number; possiblePoints: number };
  business: { count: number; points: number; possiblePoints: number };
  database: { count: number; points: number; possiblePoints: number };
} => {
  const layerDetails = {
    ui: { count: 0, points: 0, possiblePoints: 0 },
    business: { count: 0, points: 0, possiblePoints: 0 },
    database: { count: 0, points: 0, possiblePoints: 0 },
  };

  // Get points using existing calculatePointsByLayer function
  const pointsByLayer = calculatePointsByLayer(components);
  layerDetails.ui.points = pointsByLayer.userInterface;
  layerDetails.business.points = pointsByLayer.business;
  layerDetails.database.points = pointsByLayer.database;

  // Get possible points using calculatePossiblePointsByLayer function
  const possiblePointsByLayer = calculatePossiblePointsByLayer(components);
  layerDetails.ui.possiblePoints = possiblePointsByLayer.userInterface;
  layerDetails.business.possiblePoints = possiblePointsByLayer.business;
  layerDetails.database.possiblePoints = possiblePointsByLayer.database;

  // Count components and subcomponents by layer
  const countedParentComponents = new Set<number>();
  const countedSubComponents = new Set<number>();

  for (const component of components) {
    // Assign parent component count to the correct layer based on className
    if (!countedParentComponents.has(component.id)) {
      // Determine layer for parent component
      let layer: "ui" | "business" | "database" = "ui";
      const className = (component.className || "").toLowerCase();
      if (
        className === "non-interactive end-user output service" ||
        className === "interface service to other applications" ||
        className === "interface service from other applications" ||
        className === "algorithmic or manipulation service"
      ) {
        layer = "business";
      } else if (className === "data storage service") {
        layer = "database";
      }
      layerDetails[layer].count++;
      countedParentComponents.add(component.id);
    }

    // Count subcomponents by their subtype
    if (component.subComponents && component.subComponents.length > 0) {
      for (const subComponent of component.subComponents) {
        const subType = subComponent.subComponentType?.toUpperCase() || "";

        if (countedSubComponents.has(subComponent.id)) continue;

        if (subType.startsWith("UI-")) {
          layerDetails.ui.count++;
          countedSubComponents.add(subComponent.id);
        } else if (subType.startsWith("B-")) {
          layerDetails.business.count++;
          countedSubComponents.add(subComponent.id);
        } else if (subType.startsWith("D-")) {
          layerDetails.database.count++;
          countedSubComponents.add(subComponent.id);
        }
      }
    }
  }

  return layerDetails;
};

/**
 * Calculate multilayer message counts between layers
 */
export const calculateMLAMessageCounts = (
  components: TGenericComponent[],
): {
  uiToBusiness: number;
  businessToUi: number;
  businessToDatabase: number;
  databaseToBusiness: number;
} => {
  const messageCounts = {
    uiToBusiness: 0,
    businessToUi: 0,
    businessToDatabase: 0,
    databaseToBusiness: 0,
  };

  for (const component of components) {
    if (!component.subComponents) continue;

    for (const subComponent of component.subComponents) {
      const subType = subComponent.subComponentType;

      if (subType === "UI-B") {
        messageCounts.uiToBusiness++;
      } else if (subType === "B-UI") {
        messageCounts.businessToUi++;
      } else if (subType === "B-D") {
        messageCounts.businessToDatabase++;
      } else if (subType === "D-B") {
        messageCounts.databaseToBusiness++;
      }
    }
  }

  return messageCounts;
};

/**
 * Calculate counts and points for components that interface directly with
 * other (external) applications, separate from the UI/business/database
 * interfaces above. These components have no subComponents of their own,
 * so each qualifying component counts as one interface.
 */
export const calculateExternalInterfaceDetails = (
  components: TGenericComponent[],
): {
  toOtherApplications: { count: number; points: number };
  fromOtherApplications: { count: number; points: number };
} => {
  const details = {
    toOtherApplications: { count: 0, points: 0 },
    fromOtherApplications: { count: 0, points: 0 },
  };

  for (const component of components) {
    if (component.className === "Interface service to other applications") {
      details.toOtherApplications.count++;
      details.toOtherApplications.points += calculateComponentPoints(component);
    } else if (
      component.className === "Interface service from other applications"
    ) {
      details.fromOtherApplications.count++;
      details.fromOtherApplications.points +=
        calculateComponentPoints(component);
    }
  }

  return details;
};

/**
 * Check if project has any MLA components
 */
export const hasMLAComponents = (components: TGenericComponent[]): boolean => {
  return components.some((component) => component.isMLA);
};
