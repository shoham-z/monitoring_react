import { MouseEvent, useState } from 'react';
import {
  Item,
  ItemParams,
  Menu,
  RightSlot,
  useContextMenu,
} from 'react-contexify';
import switchImg from '../../img/switch.png';
import '../styles/SwitchItem.css';
import 'react-contexify/ReactContexify.css';
import AlertDialog from './AlertDialog';
import PopupMassage from './PopupMassage';

function SwitchItem(props: {
  name: string;
  reachability: any;
  ip: any;
  setSelected: any;
  isSelected: any;
  onPing: any;
  onConnect: any;
  onDelete: any;
}) {
  const {
    name,
    reachability,
    ip,
    setSelected,
    isSelected,
    onPing,
    onConnect,
    onDelete,
  } = props;
  const MENU_ID = `switch-menu-${ip}`;

  const reachabilityClass = reachability ? 'reachable' : 'unreachable';

  const { show } = useContextMenu({ id: MENU_ID });
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const handleItemDelete = () => {
    setConfirmationOpen(true);
  };

  const handleChoice = (choice: boolean) => {
    setConfirmationOpen(false);

    setAlertTitle(choice ? 'AHHHHHHHH' : 'HAAAAAAAA');
    setAlertMessage(choice ? 'bob is mad' : 'bob is happy');
    setAlertOpen(true);
    setDeleteItem(choice);
  };

  const handleItemClick = (event: ItemParams<any, any>) => {
    switch (event.id) {
      case 'ping':
        onPing(ip, 1);
        break;
      case 'connect':
        onConnect(ip);
        break;
      case 'edit':
        console.log(`edit ${ip}`);
        break;
      case 'delete':
        handleItemDelete();
        break;
      default:
        console.log(`default ${ip}`);
    }
  };

  function displayMenu(e: MouseEvent) {
    show({ event: e });
  }

  const matchShortcutPing = (e: { ctrlKey: any; key: string }): boolean => {
    return e.ctrlKey && e.key === 'g';
  };

  const matchShortcutConnect = (e: { ctrlKey: any; key: string }): boolean => {
    return e.ctrlKey && e.key === 'h';
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={`switch-item ${reachabilityClass} ${isSelected ? 'selected' : ''}`}
      onClick={() => setSelected(ip)}
      onContextMenu={displayMenu}
    >
      <AlertDialog
        isOpen={confirmationOpen}
        setIsOpen={setConfirmationOpen}
        returnChoice={handleChoice}
      />
      <PopupMassage
        isOpen={alertOpen}
        setIsOpen={setAlertOpen}
        title={alertTitle}
        message={alertMessage}
        onDelete={() => {
          if (deleteItem) onDelete(ip);
        }}
      />
      <img src={switchImg} alt="Switch" />
      <p>{name}</p>

      <Menu id={MENU_ID} className="context-menu">
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
    </div>
  );
}

export default SwitchItem;
