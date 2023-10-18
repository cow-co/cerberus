import React from "react";
import ErrorPage from "../../pages/ErrorPage";
import { ErrorBoundary } from "react-error-boundary";

function CustomErrorBoundary(props) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorPage}
      onError={(error, errorInfo) => {
        console.error("An error has occurred!");
        console.error(error);
        console.error(errorInfo);
      }}
    >
      {props.children}
    </ErrorBoundary>
  )
}

export default CustomErrorBoundary;