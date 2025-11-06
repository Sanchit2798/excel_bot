import React, { useState, useEffect } from 'react';
import { setInLocalStorage } from '../../addin-storage';

interface ApiKeyInputProps {
  onSave: () => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSave })=> {
  const [apiKey, setApiKey] = useState('');

  const handleSaveKey = () => {
    setInLocalStorage('GOOGLE_AI_API_KEY', apiKey);
    onSave();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Excel Add-in Dev Panel</h1>

      <label htmlFor="apiKey" style={{ display: 'block', marginBottom: '0.5rem' }}>
        Enter API Key:
      </label>
      <input
        id="apiKey"
        type="text"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        style={{
          padding: '0.5rem',
          width: '100%',
          maxWidth: '400px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          fontSize: '1rem',
        }}
      />
      <button
        onClick={handleSaveKey}
        style={{
          marginTop: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: '6px',
          border: '1px solid #ccc',
          backgroundColor: '#dff0d8',
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        Save API Key
      </button>
    </div>
  );
};

export default ApiKeyInput;
