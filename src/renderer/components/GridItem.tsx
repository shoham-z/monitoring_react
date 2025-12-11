/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
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
import PopupEditItem from './PopupEditItem';
import ConfirmationDialog from './ConfirmationDialog';
import ItemInfo from './ItemInfo';

function GridItem(props: {
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
  isServerOnline: boolean;
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
  } = props;
  const MENU_ID = `switch-menu-${ip}`;

  const { show, hideAll } = useContextMenu({ id: MENU_ID });
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
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

  // Used to get app mode on component mount
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

  // Monitor menu visibility to update state and handle clicks outside
  useEffect(() => {
    if (!isContextMenuOpen) return undefined;

    const checkMenuVisibility = () => {
      const menuElement = document.querySelector(
        `.react-contexify[data-id="${MENU_ID}"]`,
      );
      if (
        !menuElement ||
        (menuElement as HTMLElement).style.display === 'none'
      ) {
        setIsContextMenuOpen(false);
      }
    };

    const handleDocumentClick = (e: Event) => {
      const target = e.target as HTMLElement;
      // Check if click is on the menu itself
      const clickedOnMenu = target.closest('.react-contexify');

      // If clicking on the menu, don't close it
      if (clickedOnMenu) return;

      // If clicking anywhere else (including this switch item or other switches), close the menu
      const menus = document.querySelectorAll('.react-contexify');
      menus.forEach((menu) => {
        (menu as HTMLElement).style.display = 'none';
      });
      setIsContextMenuOpen(false);
    };

    const interval = setInterval(checkMenuVisibility, 100);
    // Use capture phase to catch clicks before they bubble
    document.addEventListener('click', handleDocumentClick, true);

    return () => {
      clearInterval(interval);
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [isContextMenuOpen, MENU_ID]);

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
      setAlertMessage('No switch was deleted');
      setAlertOpen(true);
      return;
    }

    // User confirmed deletion - wait for server response before showing success message
    try {
      const success = await onDelete(ip);
      if (success) {
        // Only show success message if deletion actually succeeded
        setAlertTitle('The switch was deleted');
        setAlertMessage(
          `The switch with the following IP address was deleted: ${ip}`,
        );
        setAlertOpen(true);
      }
      // If deletion failed, error message is already shown by SwitchGrid
    } catch (error) {
      // Error handling is done in SwitchGrid, just don't show success message
    }
  };

  const handlePing = () => {
    onPing(ip, true);
  };

  const handleShow = () => {
    setAlertTitle('Switch info');
    setAlertMessage(`IP Address: ${ip}\nName: ${name}`);
    setAlertOpen(true);
  };

  const handleConnect = () => {
    onConnect(ip, reachability);
  };

  const handleItemClick = (event: ItemParams<any, any>) => {
    switch (event.id) {
      case 'show':
        handleShow();
        break;
      case 'ping':
        handlePing();
        break;
      case 'connect':
        handleConnect();
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

  const handleMenuClick = (event: ItemParams<any, any>) => {
    const isRestrictedAction = event.id === 'edit' || event.id === 'delete';

    event.event?.stopPropagation?.();

    if (!isServerOnline && isRestrictedAction) {
      event.event?.preventDefault?.();
      return;
    }

    setIsContextMenuOpen(false);
    handleItemClick(event);
  };

  const displayMenu = (e: MouseEvent) => {
    if (isEditOpen || confirmationOpen || alertOpen) return;
    setIsContextMenuOpen(true);
    show({ event: e });
  };

  const matchShortcutPing = (e: { ctrlKey: any; key: string }): boolean => {
    return e.ctrlKey && e.key === 'g';
  };

  const matchShortcutConnect = (e: { ctrlKey: any; key: string }): boolean => {
    return e.ctrlKey && e.key === 'h';
  };

  const doubleClicked = () => {
    handleShow();
  };

  const displaySwitch = (e: MouseEvent) => {
    e.stopPropagation();
    setIsContextMenuOpen(false);
    hideAll();
    setSelected(ip);
  };

  return (
    <>
      <div
        className={`switch-item-container ${isSelected ? 'selected' : ''}`}
        onClick={displaySwitch}
        onContextMenu={displayMenu}
        onDoubleClick={doubleClicked}
        style={{ ['--scale' as any]: scale }}
      >
        <div className={`switch-item ${reachabilityClass}`}>
          <img src={image} alt="Switch" />
        </div>
        <p className="switch-item-text">{name}</p>

        <Menu id={MENU_ID} className="context-menu">
          <Item id="show" onClick={handleMenuClick}>
            Show
          </Item>
          <Item
            id="ping"
            onClick={handleMenuClick}
            keyMatcher={matchShortcutPing}
          >
            Ping <RightSlot>Ctrl G</RightSlot>
          </Item>
          <Item
            id="connect"
            onClick={handleMenuClick}
            keyMatcher={matchShortcutConnect}
          >
            Connect <RightSlot>Ctrl H</RightSlot>
          </Item>
          <Item
            id="edit"
            onClick={handleMenuClick}
            disabled={!isServerOnline}
            className={!isServerOnline ? 'context-menu-offline' : undefined}
          >
            <span className="context-menu-label">Edit</span>
            {!isServerOnline && (
              <span className="context-menu-offline-tag">&nbsp;Offline</span>
            )}
          </Item>
          <Item
            id="delete"
            onClick={handleMenuClick}
            disabled={!isServerOnline}
            className={!isServerOnline ? 'context-menu-offline' : undefined}
          >
            <span className="context-menu-label">Delete</span>
            {!isServerOnline && (
              <span className="context-menu-offline-tag">&nbsp;Offline</span>
            )}
          </Item>
        </Menu>
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
          switchId={index}
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
