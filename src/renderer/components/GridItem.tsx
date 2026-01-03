/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useMemo, useState } from 'react';
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
  ip: any;
  scale: number;
  setSelected: () => void;
  isSelected: boolean;
  onPing: (ip: string, visible?: boolean | undefined) => Promise<void>;
  onConnect: (ip: string, reachable: boolean) => void;
  onEdit: (index: string, newIp: string, hostname: string) => void;
  onDelete: (ip: string) => Promise<boolean>;
  isServerOnline: boolean;
  appData: AppDataValues;
}) {
  const {
    index,
    name,
    reachability,
    ip,
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
  const MENU_ID = useMemo(() => `switch-menu-${ip}`, [ip]);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const chooseImg = () => {
    if (appData.appMode === 'SWITCH') return switchImg;

    const lastOctet = parseInt(ip.split('.').pop(), 10);
    if (lastOctet > 240 && lastOctet < 255) {
      return switchImg;
    }
    if (lastOctet > 0 && lastOctet < 151) {
      return encryptorImg;
    }
    return computerImg;
  };
  const image = chooseImg();
  const reachabilityClass = reachability ? 'reachable' : 'unreachable';

  const handleDelete = () => {
    setConfirmationOpen(true);
  };

  const handlesubmitEdit = (newIp: string, newName: string) => {
    onEdit(index, newIp, newName);
  };

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handleChoice = async (choice: boolean) => {
    setConfirmationOpen(false);

    if (!choice) {
      // User cancelled
      setAlertTitle('Cancelled');
      setAlertMessage('No Item was deleted');
      setAlertOpen(true);
      return;
    }

    // User confirmed deletion - wait for server response before showing success message
    try {
      const success = await onDelete(ip);
      if (success) {
        // Only show success message if deletion actually succeeded
        setAlertTitle('The Item was deleted');
        setAlertMessage(
          `The Item with the following IP address was deleted: ${ip}`,
        );
        setAlertOpen(true);
      }
      // If deletion failed, error message is already shown by Grid
    } catch (error) {
      // Error handling is done in Grid, just don't show success message
    }
  };

  const handlePing = () => {
    onPing(ip, true);
  };

  const handleShow = () => {
    setAlertTitle('Item info');
    setAlertMessage(`IP Address: ${ip}\nName: ${name}`);
    setAlertOpen(true);
  };

  const handleConnect = () => {
    onConnect(ip, reachability);
  };

  const doubleClicked = () => {
    handleShow();
  };

  return (
    <>
      <div
        className={`switch-item-container ${isSelected ? 'selected' : ''}`}
        onClick={() => {}}
        onContextMenu={() => {}}
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
      </div>
      <PopupEditItem
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        initialHostname={name}
        initialIpAddress={ip}
        onSubmitEdit={handlesubmitEdit}
      />
    </>
  );
}

export default GridItem;
