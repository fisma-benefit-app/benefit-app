import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowUpFromBracket,
  faDatabase,
  faDesktop,
  faDownload,
  faFileLines,
  faGears,
  faKeyboard,
  faList,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { ClassName, ComponentType } from "./types.ts";

const USER_INTERFACE_CLASSES: ReadonlySet<ClassName> = new Set([
  "Interactive end-user navigation and query service",
  "Interactive end-user input service",
  "Non-interactive end-user output service",
]);

const NAVIGATION_QUERY_TYPES: ReadonlySet<ComponentType> = new Set([
  "log-in log-out functions",
  "browsing lists",
  "data inquiries",
]);

export type FunctionalComponentColors = {
  badge: string;
  card: string;
  icon: string;
  border: string;
};

const DEFAULT_COLORS: FunctionalComponentColors = {
  badge: "#FFFFFF",
  card: "#E5E7EB",
  icon: "#1E73BE",
  border: "#636363",
};

export const CLASS_COLORS: Record<ClassName, FunctionalComponentColors> = {
  "Interactive end-user navigation and query service": {
    badge: "#DBEAFE",
    card: "#D8E2EC",
    icon: "#1D4ED8",
    border: "#2563EB",
  },
  "Interactive end-user input service": {
    badge: "#E7F1FB",
    card: "#D4E4F2",
    icon: "#1E73BE",
    border: "#1E73BE",
  },
  "Non-interactive end-user output service": {
    badge: "#CCFBF1",
    card: "#D4E5E2",
    icon: "#0F766E",
    border: "#0D9488",
  },
  "Interface service to other applications": {
    badge: "#FEF3C7",
    card: "#E8E2D4",
    icon: "#B45309",
    border: "#D97706",
  },
  "Interface service from other applications": {
    badge: "#FFEDD5",
    card: "#E8DCD6",
    icon: "#C2410C",
    border: "#EA580C",
  },
  "Data storage service": {
    badge: "#EDE9FE",
    card: "#DEDCE8",
    icon: "#6D28D9",
    border: "#7C3AED",
  },
  "Algorithmic or manipulation service": {
    badge: "#D1FAE5",
    card: "#D6E6DB",
    icon: "#047857",
    border: "#059669",
  },
};

export const getFunctionalComponentColors = (
  className: ClassName | null,
): FunctionalComponentColors => {
  if (!className) {
    return DEFAULT_COLORS;
  }

  return CLASS_COLORS[className];
};

const CLASS_ICONS: Record<ClassName, IconDefinition> = {
  "Interactive end-user navigation and query service": faDesktop,
  "Interactive end-user input service": faDesktop,
  "Non-interactive end-user output service": faDesktop,
  "Interface service to other applications": faArrowUpFromBracket,
  "Interface service from other applications": faDownload,
  "Data storage service": faDatabase,
  "Algorithmic or manipulation service": faGears,
};

export const getFunctionalComponentIcons = (
  className: ClassName | null,
  componentType: ComponentType | null,
): IconDefinition[] => {
  if (!className) {
    return [];
  }

  const icons: IconDefinition[] = [CLASS_ICONS[className]];

  if (!USER_INTERFACE_CLASSES.has(className)) {
    return icons;
  }

  if (className === "Interactive end-user navigation and query service") {
    if (componentType && NAVIGATION_QUERY_TYPES.has(componentType)) {
      icons.push(faMagnifyingGlass);
    } else if (componentType === "selection lists") {
      icons.push(faList);
    }
  } else if (className === "Interactive end-user input service") {
    icons.push(faKeyboard);
  } else if (className === "Non-interactive end-user output service") {
    icons.push(faFileLines);
  }

  return icons;
};
