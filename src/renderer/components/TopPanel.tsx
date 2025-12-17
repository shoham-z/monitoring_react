import { useEffect, useState } from 'react';
import '../styles/TopPanel.css';
import ButtonAddItem from './ButtonAddItem';

function TopPanel(props: {
  addItem: any;
  updateFilter: any;
  isServerOnline: boolean;
}) {
  const { addItem, updateFilter, isServerOnline } = props;

  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (!isServerOnline) {
      setFormOpen(false);
    }
  }, [isServerOnline]);

  const inputHandler = (e: { target: { value: any } }) => {
    updateFilter(e.target.value);
  };

  return (
    <div className="top-panel">
      <div className="top-panel__button-group">
        {!isServerOnline && (
          <span className="server-status offline">Server Offline</span>
        )}
        <button
          type="button"
          className="mui-button trigger"
          onClick={() => {
            if (isServerOnline) {
              setFormOpen(true);
            }
          }}
          disabled={!isServerOnline}
          title={
            !isServerOnline
              ? 'Server is offline. Cannot add devices.'
              : 'Add a new switch'
          }
        >
          Add Switch
        </button>

        <ButtonAddItem
          callback={addItem}
          isOpen={formOpen}
          setOpen={setFormOpen}
        />
      </div>

      <input type="text" onChange={inputHandler} />
    </div>
  );
}

export default TopPanel;
