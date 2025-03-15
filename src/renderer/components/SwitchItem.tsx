/* eslint-disable prettier/prettier */
import { useState } from "react";
import '../styles/SwitchItem.css';

function SwitchItem(props: {name: string, reachability: any}) {
  const {name, reachability} = props;
  const [switchName, setSwitchName] = useState(name);



  return (
    <div className="switch-item">
      <img src="../../img/killjoy_kirby" alt="killjoy kirby"/>
      <p>{switchName}</p>
    </div>
  );
}

export default SwitchItem;
