import { useContext } from "react";
import { AlertContext } from "../context/AlertContext";

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context)
    throw new Error("useAlert() must be used within an <AlertProvider>");
  return context;
}
