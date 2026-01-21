import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const FatalError = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);

  useEffect(() => {
    const handleError = (error, errorInfo) => {
      setHasError(true);
      setError(error);
      setErrorInfo(errorInfo);
    };

    const errorHandler = (event) => {
      handleError(event.error, { componentStack: event.error.stack });
    };

    window.addEventListener('error', errorHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  if (hasError) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Something went wrong.</h1>
        <p>We're sorry, but something went wrong. Please try again later.</p>
        <details style={{ whiteSpace: 'pre-wrap' }}>
          {error && error.toString()}
          <br />
          {errorInfo && errorInfo.componentStack}
        </details>
      </div>
    );
  }

  return children;
};

FatalError.propTypes = {
  children: PropTypes.node.isRequired,
};

export default FatalError;
