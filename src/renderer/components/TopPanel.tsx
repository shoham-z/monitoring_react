import { useEffect, useState } from 'react';
import '../styles/TopPanel.css';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import ButtonAddItem from './ButtonAddItem';

function TopPanel(props: {
  addItem: any;
  updateFilter: any;
  isServerOnline: boolean;
  network: string;
}) {
  const { addItem, updateFilter, isServerOnline, network } = props;

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

  const { t } = useTranslation();

  return (
    <div className="top-panel">
      <div className="top-panel__button-group">
        {!isServerOnline && (
          <span className="server-status offline">{t('serverOffline')}</span>
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
            !isServerOnline ? t('serverOfflineExplained') : t('addExplained')
          }
        >
          {t('add')}
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

      <div className="top-panel__network-info">
        <strong>{network || 'No network'}</strong>
      </div>
    </div>
  );
}

export default TopPanel;
