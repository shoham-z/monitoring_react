import { MouseEvent, useEffect, useState } from 'react';
import {
  Item,
  ItemParams,
  Menu,
  RightSlot,
  useContextMenu,
} from 'react-contexify';
import switchImg from '../../img/switch.png';
import computerImg from '../../img/computer.png';
import encryptorImg from '../../img/encryptor.png';
import '../styles/SwitchItem.css';
import 'react-contexify/ReactContexify.css';
import AlertDialog from './AlertDialog';
import PopupEditItem from './PopupEditItem';
import ConfirmationDialog from './ConfirmationDialog';

function SwitchItem(props: {
  index: any;
  name: string;
  reachability: any;
  ip: any;
  scale: any;
  setSelected: any;
  isSelected: any;
  onPing: any;
  onConnect: any;
  onEdit: any;
  onDelete: any;
}) {
  const {
    index,
    name,
    reachability,
    ip,
    scale,
    setSelected,
    isSelected,
    onPing,
    onConnect,
    onEdit,
    onDelete,
  } = props;
  const MENU_ID = `switch-menu-${ip}`;

  const { show } = useContextMenu({ id: MENU_ID });
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [APP_MODE, SetAppMode] = useState('');
  const chooseImg = () => {
    if (APP_MODE === 'SWITCH') return switchImg;

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

  useEffect(() => {
    const readServers = async () => {
      const result = await window.electron.ipcRenderer.getVars();
      if (result.success) {
        SetAppMode(result.content.MODE);
      } else {
        // console.log(result.error || 'Unknown error');
      }
    };

    readServers();
  }, []);

  const handleDelete = () => {
    setConfirmationOpen(true);
  };

  const handlesubmitEdit = (newIp: string, newName: string) => {
    onEdit(index, newIp, newName);
  };

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handleChoice = (choice: boolean) => {
    setConfirmationOpen(false);

    setAlertTitle(choice ? 'The switch was deleted' : 'Cancelled');
    setAlertMessage(
      choice
        ? `The switch with the following IP address was deleted: ${ip}`
        : 'No switch was deleted',
    );
    setAlertOpen(true);
    setDeleteItem(choice);
  };

  const handlePing = () => {
    onPing(ip, true);
  };

  const openShow = () => {
    setAlertTitle('Switch info');
    setAlertMessage(`IP Address: ${ip}\nName: ${name}`);
    setAlertOpen(true);
  };

  const handleItemClick = (event: ItemParams<any, any>) => {
    switch (event.id) {
      case 'show':
        openShow();
        break;
      case 'ping':
        handlePing();
        break;
      case 'connect':
        onConnect(ip, reachability);
        break;
      case 'edit':
        handleEdit();
        break;
      case 'delete':
        handleDelete();
        break;
      default:
      // console.log(`default ${ip}`);
    }
  };

  function displayMenu(e: MouseEvent) {
    if (isEditOpen || confirmationOpen || alertOpen) return;
    show({ event: e });
  }

  const matchShortcutPing = (e: { ctrlKey: any; key: string }): boolean => {
    return e.ctrlKey && e.key === 'g';
  };

  const matchShortcutConnect = (e: { ctrlKey: any; key: string }): boolean => {
    return e.ctrlKey && e.key === 'h';
  };

  const doubleClicked = (e: MouseEvent) => {
    // Prevent double-clicks inside the edit popup from bubbling and opening the show dialog
    e.stopPropagation();
    if (isEditOpen || confirmationOpen || alertOpen) return;
    openShow();
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={`switch-item ${reachabilityClass} ${isSelected ? 'selected' : ''}`}
      onClick={(e: MouseEvent) => {
        e.stopPropagation();
        if (isEditOpen || confirmationOpen || alertOpen) return;
        setSelected(ip);
      }}
      onContextMenu={displayMenu}
      onDoubleClick={doubleClicked}
      style={{ ['--scale' as any]: scale }}
    >
      <img src={image} alt="Switch" />
      <p className="switch-item-text">{name}</p>

      <Menu id={MENU_ID} className="context-menu">
        <Item id="show" onClick={handleItemClick}>
          Show
        </Item>
        <Item
          id="ping"
          onClick={handleItemClick}
          keyMatcher={matchShortcutPing}
        >
          Ping <RightSlot>Ctrl G</RightSlot>
        </Item>
        <Item
          id="connect"
          onClick={handleItemClick}
          keyMatcher={matchShortcutConnect}
        >
          Connect <RightSlot>Ctrl H</RightSlot>
        </Item>
        <Item id="edit" onClick={handleItemClick}>
          Edit
        </Item>
        <Item id="delete" onClick={handleItemClick}>
          Delete
        </Item>
      </Menu>
      <PopupEditItem
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        initialHostname={name}
        initialIpAddress={ip}
        onSubmitEdit={handlesubmitEdit}
      />
      <ConfirmationDialog
        ip={ip}
        isOpen={confirmationOpen}
        setIsOpen={setConfirmationOpen}
        returnChoice={handleChoice}
      />

      <AlertDialog
        isOpen={alertOpen}
        setIsOpen={setAlertOpen}
        title={alertTitle}
        message={alertMessage}
        onDelete={() => {
          if (deleteItem) onDelete(ip);
        }}
      />
    </div>
  );
}

export default SwitchItem;
