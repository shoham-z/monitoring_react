import { useEffect, useState } from 'react';
import '../styles/TopPanel.css';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ButtonAddItem from './ButtonAddItem';

function TopPanel(props: {
  addItem: any;
  updateFilter: any;
  isServerOnline: boolean;
}) {
  const { addItem, updateFilter, isServerOnline } = props;

  const [filter, setFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (!isServerOnline) {
      setFormOpen(false);
    }
  }, [isServerOnline]);

  useEffect(() => {
    updateFilter(filter);
  }, [filter, updateFilter]);

  const inputHandler = (e: { target: { value: any } }) => {
    setFilter(e.target.value);
    updateFilter(e.target.value);
  };

  const clearFilter = () => {
    setFilter('');
    updateFilter('');
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

      <input type="text" onChange={inputHandler} value={filter} />

      <IconButton aria-label="delete" onClick={clearFilter}>
        <CloseIcon color="primary" />
      </IconButton>
    </div>
  );
}

export default TopPanel;
