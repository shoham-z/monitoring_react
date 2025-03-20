/* eslint-disable default-case */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable prettier/prettier */
import { MouseEvent, useEffect, useState } from "react";
import { Item, Menu, Separator, useContextMenu } from 'react-contexify';
import switchImg from '../../img/switch.png'
import '../styles/SwitchItem.css';

const MENU_ID = 'switch_context_menu';

function SwitchItem(props: {name: string, reachability: any, ip: any}) {
  const { show } = useContextMenu({ id: MENU_ID });

  const {name, reachability, ip} = props;
  const [switchName, _setSwitchName] = useState(name);


  const styleclass = reachability === "up" ? "reachable" : "unreachable";

  const handleItemClick = (event) => {
    console.log(event)
    switch (event.id) {
      case "copy":
        console.log(event, props)
        break;
      case "cut":
        console.log(event, props);
        break;

    }

    console.log("HHHHHHHHHHHHHHHHHHAAAAAAAAAAAAAAAAAAA")
  }

  function displayMenu(e){
    // put whatever custom logic you need
    // you can even decide to not display the Menu
    show({
      event: e,
    });
  }

  return (
    <div className={`switch-item ${  styleclass}`} onContextMenu={displayMenu}>
      <img src={switchImg} alt="killjoy kirby"/>
      <p>{switchName}</p>
      <Menu id={MENU_ID} className="context-menu">
        <Item id="copy" onClick={handleItemClick}>Ping {ip}</Item>
        <Item id="cut" onClick={handleItemClick}>Cut</Item>
        <Separator />
        <Item disabled>Disabled</Item>
        <Separator />
      </Menu>
    </div>
  );
}

export default SwitchItem;
