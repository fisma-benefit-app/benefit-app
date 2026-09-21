import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useTranslations from "../hooks/useTranslations.ts";
import { getFunctionalComponentIcons } from "../lib/fc-icons.ts";
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

  if (icons.length === 0) {
    return null;
  }

  const label = [
    componentClass ? translation.classNameOptions[componentClass] : null,
    componentType ? translation.componentTypeOptions[componentType] : null,
  ]
    .filter(Boolean)
    .join(" — ");

  const sizeClasses =
    size === "sm"
      ? "inline-flex items-center gap-1 text-fisma-blue text-sm"
      : "inline-flex items-center gap-1.5 bg-white border-2 border-fisma-gray text-fisma-blue px-2 py-2 rounded-md shrink-0";

  return (
    <span className={sizeClasses} title={label} aria-label={label}>
      {icons.map((icon, index) => (
        <FontAwesomeIcon
          key={`${icon.iconName}-${index}`}
          icon={icon}
          aria-hidden
        />
      ))}
    </span>
  );
}
