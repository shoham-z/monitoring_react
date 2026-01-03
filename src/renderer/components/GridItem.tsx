/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { MouseEvent, useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
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
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

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

  const handleClose = () => {
    setContextMenu(null);
  };

  const handleDelete = () => {
    if (!isServerOnline) {
      return;
    }
    setConfirmationOpen(true);
    handleClose();
  };

  const handlesubmitEdit = (newIp: string, newName: string) => {
    onEdit(index, newIp, newName);
  };

  const handleEdit = () => {
    if (!isServerOnline) {
      return;
    }
    setIsEditOpen(true);
    handleClose();
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
      console.error(error);
    }
  };

  const handlePing = () => {
    onPing(ip, true);
    handleClose();
  };

  const handleShow = () => {
    setAlertTitle('Item info');
    setAlertMessage(`IP Address: ${ip}\nName: ${name}`);
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
    event.preventDefault();

    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null,
    );

    // Prevent text selection lost after opening the context menu on Safari and Firefox
    const selection = document.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      setTimeout(() => {
        selection.addRange(range);
      });
    }
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
        <Menu
          open={contextMenu !== null}
          onClose={handleClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={handleShow}>Show</MenuItem>
          <MenuItem onClick={handlePing}>
            <ListItemText>Ping</ListItemText>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Ctrl + G
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleConnect}>
            <ListItemText>Connect</ListItemText>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Ctrl + H
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleEdit}>Edit</MenuItem>
          <MenuItem onClick={handleDelete}>Delete</MenuItem>
        </Menu>
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
