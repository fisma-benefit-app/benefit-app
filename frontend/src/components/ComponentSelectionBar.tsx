import useTranslations from "../hooks/useTranslations.ts";

// Floating bar shown while components are selected. Fixed so it floats over
// the grid instead of pushing the cards down; right-20 keeps it clear of the
// scroll-to-top button on narrow screens.
export default function ComponentSelectionBar({
  count,
  onClear,
}: {
  count: number;
  onClear: () => void;
}) {
  const translation = useTranslations().projectPage;

  return (
    <div className="fixed bottom-4 left-4 right-20 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-max sm:max-w-[calc(100vw-12rem)] z-40 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border-2 border-fisma-blue bg-blue-50 p-3 text-sm shadow-lg">
      <strong>
        {count} {translation.componentsSelected}
      </strong>
      <button
        type="button"
        className="bg-fisma-blue hover:bg-fisma-dark-blue text-white py-1 px-3 cursor-pointer"
        onClick={onClear}
      >
        {translation.clearSelection}
      </button>
    </div>
  );
}
