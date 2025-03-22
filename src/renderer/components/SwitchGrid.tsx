/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react';
import '../styles/SwitchGrid.css';
import SwitchItem from './SwitchItem';


function ping(ip: number, count: number) {
  window.electron.ipcRenderer.sendPing(ip, count)
}

function SwitchGrid() {
  const [selectedIp, setSelectedIp] = useState(-1);
  const [switchList, setSwitchList] = useState([]);
  // send get request to get all switches/items

  // add multiple child objects

  useEffect(() => {
    console.log("Updated switchList:", switchList);
  }, [switchList]); // This will run whenever switchList changes

  useEffect(() => {
    setSwitchList([{name:"kaban", reachability:true , ip:"192.168.1.20"},
      {name:"ramad", reachability:false, ip:"192.168.1.10"},
      {name:"reshatot", reachability:false, ip:"8.8.8.8"}])

/**    fetch("http://google.com") // Replace with your API URL
        .then(response => response.json()) // Parse JSON response
        .then(data => setSwitchList(data)) // Update state with fetched data
        .catch(error => console.error("Error fetching data:", error));

         */
}, []); // Empty dependency array = runs once on mount

  // used for the event listener for clicked item
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!selectedIp) return; // No div selected, ignore key events

      if (event.ctrlKey && event.key === "g") {
        ping(selectedIp, 1);
      } else if (event.ctrlKey && event.key === "h") {
        console.log(`Ctrl + H pressed on Div ${selectedIp}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIp]);

  // used to ping all devices every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
        console.log("Function is running every 10 seconds!", new Date());
        switchList.forEach((element) => ping(element.ip, 1));
    }, 10000);

    return () => clearInterval(intervalId);
}, [switchList]);

  const updateReachability = (ip, reachablilty) => {
    const updatedSwitchList = switchList.map((item) =>
      item.ip === ip ? { ...item, reachability: reachablilty } : item
    );

    setSwitchList(updatedSwitchList);
  }

window.electron.ipcRenderer.onPingResponse((data: any) => {
  updateReachability(data.ip, data.success)
  // set switch reachability to the corresponding value
});

  const handleSelect = (ip: string) => {
    setSelectedIp(ip);
  };


  return (
    <div className="split switch_div">
      <div className="container_flex" id="container_flex">
      {switchList.map((x)=>{
        return <SwitchItem key={x.name}
            name={x.name}
            reachability={x.reachability}
            ip={x.ip}
            isSelected={selectedIp.toString() === x.ip}
            setSelected={() => handleSelect(x.ip)}
            onPing={ping}/>
    })}
      </div>
    </div>
  );
}

export default SwitchGrid;
