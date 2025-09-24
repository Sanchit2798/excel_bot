import React from 'react';
import ReactDOM from 'react-dom/client';

const Reload: React.FC = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Excel Add-in Dev Panel</h1>
      <button onClick={handleReload}>Reload Page</button>
    </div>
  );
};

export default Reload;
