import { useState } from 'react';
import '../styles/TopPanel.css';
import ButtonAddItem from './ButtonAddItem';

function TopPanel(props: { addSwitch: any; updateFilter: any }) {
  const { addSwitch, updateFilter } = props;

  const [formOpen, setFormOpen] = useState(false);

  const inputHandler = (e: { target: { value: any } }) => {
    updateFilter(e.target.value);
  };

  return (
    <div className="top-panel">
      <button
        type="button"
        className="mui-button trigger"
        onClick={() => {
          setFormOpen(true);
        }}
      >
        Add Switch
      </button>

      <ButtonAddItem
        callback={addSwitch}
        isOpen={formOpen}
        setOpen={setFormOpen}
      />

      <input type="text" onChange={inputHandler} />
    </div>
  );
}

export default TopPanel;
