/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { MouseEvent, useState } from 'react';
import { ControlledMenu, MenuItem } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import { useTranslation } from 'react-i18next';
import switchImg from '../../img/switch.png';
import computerImg from '../../img/computer.png';
import encryptorImg from '../../img/encryptor.png';
import '../styles/GridItem.css';
import PopupEditItem from './PopupEditItem';
import ConfirmationDialog from './ConfirmationDialog';
import ItemInfo from './ItemInfo';
import { AppDataValues } from '../hooks/useAppData';

function GridItem(props: {
  index: any;
  name: string;
  reachability: boolean;
  ip: string;
  location: string;
  scale: number;
  setSelected: () => void;
  isSelected: boolean;
  onPing: (ip: string, visible?: boolean | undefined) => Promise<void>;
  onConnect: (ip: string, reachable: boolean) => void;
  onEdit: (
    index: string,
    newIp: string,
    hostname: string,
    newLocation: string,
  ) => void;
  onDelete: (ip: string) => Promise<boolean>;
  isServerOnline: boolean;
  appData: AppDataValues;
}) {
  const {
    index,
    name,
    reachability,
    ip,
    location,
    isServerOnline,
    scale,
    setSelected,
    isSelected,
    onPing,
    onConnect,
    onEdit,
    onDelete,
    appData,
  } = props;
  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const chooseImg = () => {
    if (appData.appMode === 'SWITCH') return switchImg;
    return encryptorImg;
  };
  const image = chooseImg();
  const reachabilityClass = reachability ? 'reachable' : 'unreachable';

  const handleClose = () => {
    setMenuOpen(false);
  };

  const handleDelete = () => {
    if (!isServerOnline) {
      return;
    }
    setConfirmationOpen(true);
    handleClose();
  };

  const handlesubmitEdit = (
    newIp: string,
    newName: string,
    newLocation: string,
  ) => {
    onEdit(index, newIp, newName, newLocation);
  };

  const handleEdit = () => {
    if (!isServerOnline) {
      return;
    }
    setIsEditOpen(true);
    handleClose();
  };

  const { t } = useTranslation();

  const handleChoice = async (choice: boolean) => {
    setConfirmationOpen(false);

    if (!choice) {
      // User cancelled
      setAlertTitle(t('cancelled'));
      setAlertMessage(t('noItemWasDeleted'));
      setAlertOpen(true);
      return;
    }

    // User confirmed deletion - wait for server response before showing success message
    try {
      const success = await onDelete(ip);
      if (success) {
        // Only show success message if deletion actually succeeded
        setAlertTitle(t('itemWasDeletedTitle'));
        setAlertMessage(t('itemWasDeletedMessage', { ip }));
        setAlertOpen(true);
      }
      // If deletion failed, error message is already shown by Grid
    } catch (error) {
      // Error handling is done in Grid, just don't show success message
      console.error(error);
    }
  };

  const handlePing = () => {
    onPing(ip, true);
    handleClose();
  };

  const handleShow = () => {
    setAlertTitle(t('itemInfo'));
    setAlertMessage(t('itemInfoMessage', { ip, name, location }));
    setAlertOpen(true);
    handleClose();
  };

  const handleConnect = () => {
    onConnect(ip, reachability);
    handleClose();
  };

  const doubleClicked = () => {
    handleShow();
  };

  const handleContextMenu = (event: MouseEvent) => {
    if (typeof document.hasFocus === 'function' && !document.hasFocus()) return;
    event.preventDefault();
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    setMenuOpen(true);
  };

  const displaySwitch = (e: MouseEvent) => {
    e.stopPropagation();
    handleClose();
    setSelected();
  };

  return (
    <>
      <div
        className={`switch-item-container ${isSelected ? 'selected' : ''}`}
        onClick={displaySwitch}
        onContextMenu={handleContextMenu}
        onDoubleClick={doubleClicked}
        style={{ ['--scale' as any]: scale }}
      >
        <div className={`switch-item ${reachabilityClass}`}>
          <img src={image} alt="Switch" />
        </div>
        <p className="switch-item-text">{name}</p>
        <ConfirmationDialog
          ip={ip}
          isOpen={confirmationOpen}
          setIsOpen={setConfirmationOpen}
          returnChoice={handleChoice}
        />

        <ItemInfo
          isOpen={alertOpen}
          setIsOpen={setAlertOpen}
          title={alertTitle}
          message={alertMessage}
          onDelete={() => {}}
          ItemId={index}
        />

        <ControlledMenu
          anchorPoint={anchorPoint}
          state={menuOpen ? 'open' : 'closed'}
          onClose={handleClose}
        >
          <MenuItem onClick={handleShow}>{t('show')}</MenuItem>
          <MenuItem onClick={handlePing}>
            {t('ping')}{' '}
            <span style={{ marginLeft: 'auto', opacity: 0.6 }}>Ctrl G</span>
          </MenuItem>

          <MenuItem onClick={handleConnect}>
            {t('connect')}{' '}
            <span style={{ marginLeft: 'auto', opacity: 0.6 }}>Ctrl H</span>
          </MenuItem>
          <MenuItem disabled={!isServerOnline} onClick={handleEdit}>
            {t('edit')}
          </MenuItem>
          <MenuItem disabled={!isServerOnline} onClick={handleDelete}>
            {t('delete')}
          </MenuItem>
        </ControlledMenu>
      </div>
      <PopupEditItem
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        initialHostname={name}
        initialIpAddress={ip}
        initialLocation={location}
        onSubmitEdit={handlesubmitEdit}
      />
    </>
  );
}

export default GridItem;
