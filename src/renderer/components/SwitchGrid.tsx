/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react';
import '../styles/SwitchGrid.css';
import SwitchItem from './SwitchItem';


function SwitchGrid() {
  const [selectedIp, setSelectedIp] = useState(-1);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!selectedIp) return; // No div selected, ignore key events

      if (event.ctrlKey && event.key === "g") {
        console.log(`Ctrl + G pressed on Div ${selectedIp}`);
      } else if (event.ctrlKey && event.key === "h") {
        console.log(`Ctrl + H pressed on Div ${selectedIp}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown); // Cleanup
  }, [selectedIp]); // Runs when `selectedId` changes

  const handleSelect = (ip: string) => {
    console.log(ip)
    setSelectedIp(ip);
  };



  // send get request to get all switches/items

  // add multiple child objects
  const switchList = [{name:"kaban", reachability:"up", ip:"192.168.1.20"},
    {name:"ramad", reachability:"down", ip:"192.168.1.10"},
    {name:"reshatot", reachability:"up", ip:"192.168.1.30"}];



  return (
    <div className="split switch_div">
      <div className="container_flex" id="container_flex">
      {switchList.map((x)=>{
        return <SwitchItem key={x.name}
            name={x.name}
            reachability={x.reachability}
            ip={x.ip}
            isSelected={selectedIp.toString() === x.ip}
            setSelected={() => handleSelect(x.ip)}/>
    })}
      </div>
    </div>
  );
}

export default SwitchGrid;
