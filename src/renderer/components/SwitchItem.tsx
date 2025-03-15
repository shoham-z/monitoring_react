/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable prettier/prettier */
import { useState } from "react";
import ContextMenu from './ContextMenu';
import switchImg from '../../img/switch.png'
import '../styles/SwitchItem.css';

function SwitchItem(props: {name: string, reachability: any}) {
  const {name, reachability} = props;
  const [switchName, _setSwitchName] = useState(name);

  const styleclass = reachability==="up" ? "reachable" : "unreachable";

  function showSwitchContextMenu(event){
    event.preventDefault();

    const xPos = `${event.pageX  }px`;
    const yPos = `${event.pageY  }px`;

    <ContextMenu top={xPos} left={yPos}  />
  }

  return (
    <div className={`switch-item ${  styleclass}`}>
      <img src={switchImg} alt="killjoy kirby" onContextMenu={showSwitchContextMenu}/>
      <p>{switchName}</p>
    </div>
  );
}

export default SwitchItem;
