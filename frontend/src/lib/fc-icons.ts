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
