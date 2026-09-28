import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useTranslations from "../hooks/useTranslations.ts";
import {
  getFunctionalComponentColors,
  getFunctionalComponentIcons,
} from "../lib/fc-icons.ts";
import { ClassName, ComponentType } from "../lib/types.ts";

type ComponentClassIconsProps = {
  componentClass: ClassName | null;
  componentType: ComponentType | null;
  size?: "sm" | "md";
};

export default function ComponentClassIcons({
  componentClass,
  componentType,
  size = "md",
}: ComponentClassIconsProps) {
  const translation = useTranslations().functionalClassComponent;
  const icons = getFunctionalComponentIcons(componentClass, componentType);
  const colors = getFunctionalComponentColors(componentClass);

  if (icons.length === 0 || !componentClass) {
    return null;
  }

  const fullLabel = [
    translation.classNameOptions[componentClass],
    componentType ? translation.componentTypeOptions[componentType] : null,
  ]
    .filter(Boolean)
    .join(" — ");
  const shortLabel = translation.classNameShort[componentClass];

  const sizeClasses =
    size === "sm"
      ? "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium shrink-0"
      : "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium shrink-0 whitespace-nowrap";

  return (
    <span
      className={sizeClasses}
      style={{
        color: colors.icon,
        backgroundColor: colors.badge,
        borderColor: colors.border,
      }}
      title={fullLabel}
      aria-label={fullLabel}
    >
      {icons.map((icon, index) => (
        <FontAwesomeIcon
          key={`${icon.iconName}-${index}`}
          icon={icon}
          aria-hidden
        />
      ))}
      <span>{shortLabel}</span>
    </span>
  );
}
