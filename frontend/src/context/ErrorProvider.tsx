import { useState, ReactNode } from "react";
import { ErrorContext } from "./ErrorContext";

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<string | null>(null);

  const showError = (message: string) => {
    setError(message);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <ErrorContext.Provider value={{ error, showError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
};
