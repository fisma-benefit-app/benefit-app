const compactViewStyles = {
  card: "flex flex-col gap-1 border-2 w-full p-1.5 rounded-md border-l-4",
  header: "flex flex-row flex-wrap items-center justify-between gap-1",
  titleContainer: "flex-1 min-w-[120px] flex items-center gap-1",
  titleInput:
    "w-full border border-fisma-gray bg-white px-1.5 py-1 text-xs rounded",
  headerActions: "flex flex-wrap gap-1 items-center justify-end",
  headerActionContainer: "flex gap-1 items-center",
  collapseButton:
    "bg-fisma-blue hover:bg-fisma-dark-blue text-white py-1 px-2 text-xs cursor-pointer",
  metadata: "flex flex-row flex-wrap gap-1 items-center",
  select:
    "border border-fisma-light-gray bg-white px-1.5 py-1 flex-1 min-w-[120px] text-xs rounded",
  componentTypeSelect:
    "border border-fisma-light-gray bg-white px-1.5 py-1 text-xs rounded",
  componentTypeContainer: "flex flex-col gap-1 flex-1 min-w-[120px]",
  paraMeterInputField:
    "flex flex-wrap gap-1 bg-white border border-fisma-light-gray p-1 rounded-md mt-0.5",
  parameterItem: "flex flex-row gap-1 items-center",
  parameterLabel: "font-medium text-[10px] leading-tight",
  parameterInput:
    "w-[45px] border border-fisma-light-gray bg-white px-1 py-0.5 text-xs rounded",
  progressContainer: "border-t pt-1",
  progressText:
    "flex justify-between text-[10px] leading-tight font-medium text-gray-600 mb-0.5",
  progressBar: "w-full bg-gray-200 rounded-full h-1",
  progressBarFill: "bg-blue-400 h-1 rounded-full transition-all duration-300",
  deleteButton: "text-white py-1 px-2 text-xs",
  deleteButtonActive: "bg-fisma-red hover:brightness-110 cursor-pointer",
  deleteButtonDisabled: "bg-fisma-gray",
};

const fullViewStyles = {
  card: "flex flex-col gap-4 border-2 w-full p-4 rounded-lg border-l-8",
  header:
    "flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-2",
  titleContainer: "flex-1 min-w-[200px] flex items-center gap-2",
  titleInput:
    "w-full border-2 border-fisma-gray bg-white p-2 text-sm sm:text-base",
  headerActions:
    "flex flex-wrap gap-2 items-center justify-start sm:justify-end",
  headerActionContainer: "flex gap-2 items-center",
  collapseButton:
    "bg-fisma-blue hover:bg-fisma-dark-blue text-white py-2 px-3 cursor-pointer",
  metadata: "flex flex-row flex-wrap gap-3 items-center",
  select:
    "border-2 border-fisma-light-gray bg-white p-2 flex-1 min-w-[180px] text-base rounded-md",
  componentTypeSelect:
    "border-2 border-fisma-light-gray bg-white p-2 text-base rounded-md",
  componentTypeContainer: "flex flex-col gap-2 flex-1 min-w-[180px]",
  paraMeterInputField:
    "flex flex-wrap gap-4 bg-white border-2 border-fisma-light-gray p-3 rounded-md mt-2",
  parameterItem: "flex flex-col gap-1 items-start",
  parameterLabel: "font-medium",
  parameterInput:
    "w-[120px] border-2 border-fisma-light-gray bg-white p-2 rounded-md",
  progressContainer: "border-t pt-3",
  progressText: "flex justify-between text-xs font-medium text-gray-600 mb-1",
  progressBar: "w-full bg-gray-200 rounded-full h-2",
  progressBarFill: "bg-blue-400 h-2 rounded-full transition-all duration-300",
  deleteButton: "text-white py-2 px-3",
  deleteButtonActive: "bg-fisma-red hover:brightness-110 cursor-pointer",
  deleteButtonDisabled: "bg-fisma-gray",
};

export { compactViewStyles, fullViewStyles };
