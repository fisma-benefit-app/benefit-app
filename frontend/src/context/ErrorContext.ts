import { createContext } from "react";

export interface ErrorContextType {
  error: string | null;
  showError: (message: string) => void;
  clearError: () => void;
}

export const ErrorContext = createContext<ErrorContextType | undefined>(
  undefined,
);
