import {
  calculateExternalInterfaceDetails,
  calculateMLALayerDetails,
  calculateMLAMessageCounts,
} from "../centralizedCalculations";
import type { TGenericComponent } from "../types";
import type { ArchitectureDiagramData } from "./architectureDiagram";
import { formatDelta } from "./pdfReportLayout";

// Every number the architecture diagram shows, for one version of a project.
export type DiagramFigures = {
  uiPoints: number;
  uiCount: number;
  // The business layer without the interface components, which the diagram draws as their own
  // "external applications" part.
  businessPoints: number;
  databasePoints: number;
  databaseCount: number;
  externalPoints: number;
  externalCount: number;
  uiToBusiness: number;
  businessToUi: number;
  businessToDatabase: number;
  databaseToBusiness: number;
  toOtherApplications: number;
  fromOtherApplications: number;
};

export type DiagramLabels = {
  uiLayer: string;
  businessLayer: string;
  databaseLayer: string;
  externalLayer: string;
  algorithmicActivities: string;
  interfaces: string;
  functions: string;
  concepts: string;
  in: string;
  out: string;
  pointUnit: string;
};

export const calculateDiagramFigures = (
  components: TGenericComponent[],
): DiagramFigures => {
  const layers = calculateMLALayerDetails(components);
  const messages = calculateMLAMessageCounts(components);
  const external = calculateExternalInterfaceDetails(components);
  const externalPoints =
    external.toOtherApplications.points + external.fromOtherApplications.points;
  return {
    uiPoints: layers.ui.points,
    uiCount: layers.ui.count,
    businessPoints: layers.business.points - externalPoints,
    databasePoints: layers.database.points,
    databaseCount: layers.database.count,
    externalPoints,
    externalCount:
      external.toOtherApplications.count + external.fromOtherApplications.count,
    uiToBusiness: messages.uiToBusiness,
    businessToUi: messages.businessToUi,
    businessToDatabase: messages.businessToDatabase,
    databaseToBusiness: messages.databaseToBusiness,
    toOtherApplications: external.toOtherApplications.count,
    fromOtherApplications: external.fromOtherApplications.count,
  };
};

// Texts and per-figure deltas for the diagram. Without `previous` (a first version) there are no
// deltas.
export const createArchitectureDiagramData = (
  current: DiagramFigures,
  previous: DiagramFigures | undefined,
  labels: DiagramLabels,
): ArchitectureDiagramData => {
  const points = (value: number) => `${value.toFixed(2)} ${labels.pointUnit}`;
  const pointsDelta = (key: keyof DiagramFigures) =>
    previous && formatDelta(current[key] - previous[key], 2);
  const countDelta = (key: keyof DiagramFigures) =>
    previous && formatDelta(current[key] - previous[key], 0);
  const interfaces = (key: keyof DiagramFigures, direction: "in" | "out") => ({
    text: `${current[key]} ${labels.interfaces} ${labels[direction]}`,
    delta: countDelta(key),
  });

  return {
    ui: {
      title: labels.uiLayer,
      points: points(current.uiPoints),
      delta: pointsDelta("uiPoints"),
      detail: `${current.uiCount} ${labels.functions}`,
      detailDelta: countDelta("uiCount"),
    },
    business: {
      title: labels.businessLayer,
      points: points(current.businessPoints),
      delta: pointsDelta("businessPoints"),
      detail: labels.algorithmicActivities,
    },
    database: {
      title: labels.databaseLayer,
      points: points(current.databasePoints),
      delta: pointsDelta("databasePoints"),
      detail: `${current.databaseCount} ${labels.concepts}`,
      detailDelta: countDelta("databaseCount"),
    },
    external: {
      title: labels.externalLayer,
      points: points(current.externalPoints),
      delta: pointsDelta("externalPoints"),
      detail: `${current.externalCount} ${labels.interfaces}`,
      detailDelta: countDelta("externalCount"),
    },
    uiBusiness: {
      in: interfaces("uiToBusiness", "in"),
      out: interfaces("businessToUi", "out"),
    },
    businessDatabase: {
      in: interfaces("databaseToBusiness", "in"),
      out: interfaces("businessToDatabase", "out"),
    },
    businessExternal: {
      in: {
        text: `${current.fromOtherApplications} ${labels.in}`,
        delta: countDelta("fromOtherApplications"),
      },
      out: {
        text: `${current.toOtherApplications} ${labels.out}`,
        delta: countDelta("toOtherApplications"),
      },
    },
  };
};
