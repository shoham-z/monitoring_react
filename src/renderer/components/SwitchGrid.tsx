import { SetStateAction, useEffect, useState } from 'react';
import '../styles/SwitchGrid.css';
import SwitchItem from './SwitchItem';
import TopPanel from './TopPanel';

interface SwitchEntry {
  name: string;
  reachability: boolean;
  ip: string;
}

function ping(ip: string) {
  window.electron.ipcRenderer.sendPing(ip);
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
    const l = [...Array(35).keys()].map((i) => {
      return { name: `${i}`, reachability: true, ip: `192.168.1.${i}` };
    });
    const a = [{ name: 'rotem', reachability: false, ip: '192.168.100.2' }];
    setSwitchList(l);

    /**    fetch(`http://${serverip}/api/getAll`) // Replace with your API URL
        .then(response => response.json()) // Parse JSON response
        .then(data => setSwitchList(data)) // Update state with fetched data
        .catch(error => console.error("Error fetching data:", error));

         */
  }, []); // Empty dependency array = runs once on mount

  // used for the event listener for clicked item
  useEffect(() => {
    const handleKeyDown = (event: { ctrlKey: any; key: string }) => {
      if (!selectedIp) return;

      if (event.ctrlKey && event.key === 'g') {
        ping(selectedIp);
      } else if (event.ctrlKey && event.key === 'h') {
        connect(selectedIp);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIp]);

  useEffect(() => {
    const intervals = switchList.map((element) =>
      setTimeout(
        () =>
          setInterval(() => {
            ping(element.ip);
            //console.log(`added event listener for ${element.ip}`);
          }, 10000),
        200,
      ),
    );
    // const intervalId = setInterval(() => {
    //   switchList.forEach((element) => {
    //     ping(element.ip);
    //     console.log(`added event listener for ${element.ip}`);
    //   });
    // }, 10000);

    return () => {
      intervals.forEach((interval) => {
        clearInterval(interval);
        //console.log(`cleared interval ${interval}`);
      });
    };
  }, [switchList]);

  const addSwitch = (ip: any, hostname: any) => {
    const newSwitch = { name: hostname, reachability: false, ip };
    setSwitchList([...switchList, newSwitch]);
    // send post request to the server, to add the item
  };

  const updateReachability = (ip: string, reachability: boolean) => {
    setSwitchList((prevList) =>
      prevList.map((item) =>
        item.ip === ip ? { ...item, reachability } : item,
      ),
    );
  };

  useEffect(() => {
    window.electron.ipcRenderer.onPingResponse((data: any) => {
      updateReachability(data.ip, data.success);
    });
  });

  const deleteSwitch = (ip: string) => {
    setSwitchList(
      switchList.filter((el) => {
        return el.ip !== ip ? el : null;
      }),
    );
  };

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
                onDelete={deleteSwitch}
              />
            ))}
        </div>
      </div>
    </>
  );
}

export default SwitchGrid;
