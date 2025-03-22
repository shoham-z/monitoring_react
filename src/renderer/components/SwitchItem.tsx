import { MouseEvent } from 'react';
import { Item, Menu, RightSlot, useContextMenu } from 'react-contexify';
import switchImg from '../../img/switch.png';
import '../styles/SwitchItem.css';
import 'react-contexify/ReactContexify.css';

function SwitchItem(props: {
  name: string;
  reachability: any;
  ip: any;
  setSelected: any;
  isSelected: any;
}) {
  const { name, reachability, ip, setSelected, isSelected } = props;
  const MENU_ID = `switch-menu-${ip}`; // Same ID for all switches to allow only one open at a time

  const reachabilityClass = reachability ? 'reachable' : 'unreachable';

  const { show } = useContextMenu({ id: MENU_ID });

  const handleItemClick = (event) => {
    switch (event.id) {
      case 'ping':
        console.log(`ping ${ip}`);
        break;
      case 'connect':
        console.log(`connect ${ip}`);
        break;
      case 'edit':
        console.log(`edit ${ip}`);
        break;
      case 'delete':
        console.log(`delete ${ip}`);
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
