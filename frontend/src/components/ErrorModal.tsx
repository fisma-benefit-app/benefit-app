import { useContext } from "react";
import { ErrorContext } from "../context/ErrorContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

export default function ErrorModal() {
  const errorContext = useContext(ErrorContext);

  if (!errorContext) {
    return null;
  }

  const { error, clearError } = errorContext;

  if (!error) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4">
        <div className="flex items-start gap-4">
          <FontAwesomeIcon
            icon={faExclamationCircle}
            className="w-6 h-6 text-fisma-red flex-shrink-0 mt-1"
          />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-700">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={clearError}
          className="mt-4 w-full bg-fisma-blue hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}
