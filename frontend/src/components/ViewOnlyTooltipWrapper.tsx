import { ReactNode, useId } from "react";

type ViewOnlyTooltipWrapperProps = {
  message?: string | null;
  children: ReactNode;
  className?: string;
};

export default function DisabledReasonTooltip({
  message,
  children,
  className = "flex flex-col",
}: ViewOnlyTooltipWrapperProps) {
  const tooltipId = useId();

  if (!message) return <>{children}</>;

  return (
    <div
      className={`group relative ${className}`}
      aria-describedby={tooltipId}
    >
      {children}
      <div
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute left-1/2 bottom-full z-50 mb-2 w-max max-w-64 -translate-x-1/2 rounded border border-gray-300 bg-white p-2 text-xs text-gray-800 shadow-lg opacity-0 transition-opacity group-hover:opacity-100"
      >
        {message}
      </div>
    </div>
  );
}