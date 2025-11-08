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

  const { show } = useContextMenu({ id: MENU_ID });
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

  function displayMenu(e: MouseEvent) {
    if (isEditOpen || confirmationOpen || alertOpen) return;
    setIsContextMenuOpen(true);
    show({ event: e });
    e.preventDefault(); // prevent default browser context menu
    e.stopPropagation();
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
    if (isEditOpen || confirmationOpen || alertOpen || isContextMenuOpen)
      return;
    openShow();
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={`switch-item ${reachabilityClass} ${isSelected ? 'selected' : ''}`}
      onClick={(e: MouseEvent) => {
        // Check if context menu is currently open first, before any other checks
        if (isContextMenuOpen) {
          // Find and hide all context menus (this forces the menu to close)
          const menus = document.querySelectorAll('.react-contexify');
          menus.forEach((menu) => {
            (menu as HTMLElement).style.display = 'none';
          });
          // Reset local state
          setIsContextMenuOpen(false);
          // Stop propagation and prevent default to ensure menu closes
          e.stopPropagation();
          e.preventDefault();
          // Don't select when closing menu
          return;
        }

        e.stopPropagation(); // Always stop propagation to prevent grid selection logic from running immediately

        if (isEditOpen || confirmationOpen || alertOpen) return;

        // If the menu was not open, proceed with selecting the item (standard left click behavior)
        setSelected(ip);
      }}
      onContextMenu={(e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isEditOpen || confirmationOpen || alertOpen) return;

        // If this switch's menu is already open, just keep it open and don't change selection
        if (isContextMenuOpen) {
          return;
        }

        // Close any other open menus first
        const menus = document.querySelectorAll('.react-contexify');
        menus.forEach((menu) => {
          (menu as HTMLElement).style.display = 'none';
        });

        setSelected(ip); // select on right-click
        displayMenu(e); // open context menu for this switch
      }}
      onDoubleClick={doubleClicked}
      style={{ ['--scale' as any]: scale }}
    >
      <img src={image} alt="Switch" />
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
        onDelete={() => {}}
      />
    </div>
  );
}

export default SwitchItem;
