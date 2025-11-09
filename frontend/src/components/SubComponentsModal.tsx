import { MLAsubComponent, Project } from "../lib/types";
import FunctionalClassComponent from "./FunctionalClassComponent";

type SubComponentsModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  subComponents: MLAsubComponent[];
  parentTitle: string;
};

export default function SubComponentsModal({
  open,
  setOpen,
  subComponents,
  parentTitle,
}: SubComponentsModalProps) {
  if (!open) return null;

  const subComponentLabels = {
    presentation: "Presentation Layer",
    businessLogic: "Business Logic Layer",
    dataAccess: "Data Access Layer",
    integration: "Integration Layer",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-fisma-blue text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            Multilayer Architecture Sub-components: {parentTitle}
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1">
          <div className="space-y-6">
            {subComponents.map((subComp) => (
              <div
                key={subComp.id}
                className="border-2 border-fisma-blue rounded-lg p-4"
              >
                <h3 className="text-lg font-bold text-fisma-blue mb-4">
                  {subComponentLabels[subComp.subComponentType]}
                </h3>
                <div className="opacity-75 pointer-events-none">
                  <FunctionalClassComponent
                    component={subComp}
                    deleteFunctionalComponent={async () => {}} // Disabled
                    project={{ functionalComponents: [] } as unknown as Project}
                    setProject={() => {}}
                    setProjectResponse={() => {}}
                    isLatest={false} // Makes it readonly
                    collapsed={false}
                    onCollapseChange={() => {}}
                    debouncedSaveProject={() => {}}
                    onMLAToggle={() => {}}
                    dragHandleProps={{}}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 flex justify-end">
          <button
            onClick={() => setOpen(false)}
            className="bg-fisma-blue hover:bg-fisma-dark-blue text-white px-6 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
