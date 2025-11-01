import React from 'react';
import ReactDOM from 'react-dom/client';

const Reload: React.FC = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Excel Add-in Dev Panel</h1>
      <button onClick={handleReload}
      style={{
              padding: "0.5rem 1.2rem",
              borderRadius: "999px",
              border: "1px solid #ccc",
              backgroundColor: "#f0f0f0",
              cursor: "pointer",
              fontWeight: 500,
              transition: "background-color 0.2s ease",
            }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
      >Reload Page
      </button>
    </div>
  );
};

export default Reload;
