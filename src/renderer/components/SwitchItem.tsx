/* eslint-disable default-case */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable prettier/prettier */
import { MouseEvent, useEffect, useState } from "react";
import { Item, Menu, RightSlot, Separator, useContextMenu } from 'react-contexify';
import switchImg from '../../img/switch.png'
import '../styles/SwitchItem.css';
import 'react-contexify/ReactContexify.css';

function SwitchItem(props: {name: string, reachability: any, ip: any}) {
  const {name, reachability, ip} = props;
  const MENU_ID = ip;


  const { show } = useContextMenu({ id: MENU_ID });
  const [switchName, _setSwitchName] = useState(name);

  const styleclass = reachability === "up" ? "reachable" : "unreachable";

  const handleItemClick = (event) => {

    // console.log(event)
    switch (event.id) {
      case "ping":
        console.log("ping")
        console.log(props)
        break;
      case "connect":
        console.log("connect");
        console.log(props)
        break;
      case "edit":
        console.log("edit")
        console.log(props)
        break;
      case "delete":
        console.log("delete")
        console.log(props)
        break;
    }

    console.log("HHHHHHHHHHHHHHHHHAAAAAAAAAAAAAAAAAAA")
  }

  function displayMenu(e){
    // put whatever custom logic you need
    // you can even decide to not display the Menu
    show({
      event: e,
    });
  }

  const matchShortcutPing = (e: KeyboardEvent) => {
    return e.ctrlKey && e.key === 'g';
  }

  const matchShortcutConnect = (e: KeyboardEvent) => {
    return e.ctrlKey && e.key === 'h';
  }


  return (
    <div className={`switch-item ${  styleclass}`} onContextMenu={displayMenu}>
      <img src={switchImg} alt="killjoy kirby"/>
      <p>{switchName}</p>
      <Menu id={MENU_ID} className="context-menu">
        <Item id="ping" onClick={handleItemClick} keyMatcher={matchShortcutPing}>
          Ping <RightSlot>Ctrl G</RightSlot>
        </Item>
        <Item id="cut" onClick={handleItemClick} keyMatcher={matchShortcutConnect}>
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
