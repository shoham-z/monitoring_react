import { useState } from 'react';
import '../styles/TopPanel.css';

function TopPanel() {
  const addSwitch = () => {
    console.log('AHHHHH');
  };

  return (
    <div className="top-panel">
      <button type="button" onClick={addSwitch}>
        Add Switch
      </button>
      <input type="text" />
    </div>
  );
}

export default TopPanel;
