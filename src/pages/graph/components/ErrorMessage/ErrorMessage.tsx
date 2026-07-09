import type { ErrorMessageProps } from "./types";
import "./styles.css";
import { useEffect } from "react";

const ErrorMessage = ({ errorMessage, setErrorMessage }: ErrorMessageProps) => {

  // Scroll when error message created
  useEffect(() => {
    const element = document.getElementById("error-box");
    element?.scrollIntoView();
  }, [])

  // Simple error message with button to dismiss
  return (
    <div className="error-box" id="error-box">
      <h2 className="error-title">Processing steps failed</h2>
      <p className="error-text">{errorMessage}</p>
      <button className="error-dismiss" onClick={() => setErrorMessage(null)}>Close</button>
    </div>
  )
}

export default ErrorMessage;