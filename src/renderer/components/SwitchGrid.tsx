import { SetStateAction, useEffect, useState } from 'react';
import '../styles/SwitchGrid.css';
import SwitchItem from './SwitchItem';
import TopPanel from './TopPanel';

interface SwitchEntry {
  name: string;
  reachability: boolean;
  ip: string;
}

function ping(ip: string, count: number) {
  window.electron.ipcRenderer.sendPing(ip, count);
}

function connectSSH(ip: string) {
  window.electron.ipcRenderer.connectRemotely(ip);
}

function connect(ip: string) {
  connectSSH(ip);
}

function SwitchGrid() {
  const [selectedIp, setSelectedIp] = useState('');
  const [switchList, setSwitchList] = useState<Array<SwitchEntry>>([]);
  const [filter, setFilter] = useState('');
  // send get request to get all switches/items

  useEffect(() => {
    // console.log('Updated switchList:', switchList);
  }, [switchList]); // This will run whenever switchList changes

  useEffect(() => {
    const a = [...Array(24).keys()].map((i) => {
      return { name: `${i}`, reachability: true, ip: `192.168.1.${i}` };
    });
    const l = [{ name: 'rotem', reachability: false, ip: '192.168.100.2' }];
    setSwitchList(l);

    /**    fetch("http://google.com") // Replace with your API URL
        .then(response => response.json()) // Parse JSON response
        .then(data => setSwitchList(data)) // Update state with fetched data
        .catch(error => console.error("Error fetching data:", error));

         */
  }, []); // Empty dependency array = runs once on mount

  // used for the event listener for clicked item
  useEffect(() => {
    // ADD PREVIOUSLY SELECTED IP AS A STATE, THEN WHEN NEW SWITCH IS CHOSEN, REMOVE THE EVENT LISTENER FROM THE PREVIOUS ONE
    const handleKeyDown = (event: { ctrlKey: any; key: string }) => {
      if (!selectedIp) return; // No div selected, ignore key events

      if (event.ctrlKey && event.key === 'g') {
        ping(selectedIp, 1);
      } else if (event.ctrlKey && event.key === 'h') {
        connect(selectedIp);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIp]);

  // used to ping all devices every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      switchList.forEach((element) => ping(element.ip, 1));
    }, 10000);

    return () => clearInterval(intervalId);
  }, [switchList]);

  const addSwitch = (ip: any, hostname: any) => {
    const newSwitch = { name: hostname, reachability: false, ip };
    setSwitchList((switchList) => [...switchList, newSwitch]);
    // send post request to the server, to add the item
  };

  const updateReachability = (ip: string, reachablilty: boolean) => {
    const updatedSwitchList = switchList.map((item) =>
      item.ip === ip ? { ...item, reachability: reachablilty } : item,
    );

    setSwitchList(updatedSwitchList);
  };

  window.electron.ipcRenderer.onPingResponse((data: any) => {
    updateReachability(data.ip, data.success);
    // set switch reachability to the corresponding value
  });

  const handleSelect = (ip: string | SetStateAction<string>) => {
    setSelectedIp(ip);
  };

  const updateFilter = (data: SetStateAction<string>) => setFilter(data);

  return (
    <>
      <TopPanel addSwitch={addSwitch} updateFilter={updateFilter} />
      <div className="switch_div">
        <div className="container_flex" id="container_flex">
          {switchList
            .filter((el) => {
              if (filter === '') return el;
              if (filter.includes('.') && el.ip.includes(filter)) return el;
              if (el.name.includes(filter)) return el;
              return null;
            })
            .map((x) => (
              <SwitchItem
                key={x.name}
                name={x.name}
                reachability={x.reachability}
                ip={x.ip}
                isSelected={selectedIp.toString() === x.ip}
                setSelected={() => handleSelect(x.ip)}
                onPing={ping}
                onConnect={connect}
              />
            ))}
        </div>
      </div>
    </>
  );
}

export default SwitchGrid;
