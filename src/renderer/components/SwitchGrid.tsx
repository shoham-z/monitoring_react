import { SetStateAction, useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/SwitchGrid.css';
import SwitchItem from './SwitchItem';
import TopPanel from './TopPanel';

interface SwitchEntry {
  id: number;
  name: string;
  reachability: boolean;
  ip: string;
}

const SERVER_IP = 'http://localhost:3001';

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

  const fetchFromServer = () => {
    axios
      .get(`${SERVER_IP}/api/getAll`)
      .then((response) => response.data) // Parse JSON response
      .then((data) => {
        console.log(data);
        return data;
      })
      .then((data) => setSwitchList(data)) // Update state with fetched data
      .catch((error) => console.error('Error fetching data:', error));
  };
  useEffect(() => {
    fetchFromServer();
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
          }, 10000),
        200,
      ),
    );

    return () => {
      intervals.forEach((interval) => {
        clearInterval(interval);
      });
    };
  }, [switchList]);

  const addSwitch = (ip: any, hostname: any) => {
    axios
      .post(
        `${SERVER_IP}/api/add`,
        { ip, name: hostname },
        { headers: { 'Content-Type': 'application/json' } },
      )
      .then((data) => console.log(data))
      .then(() => fetchFromServer())
      .catch((error) => console.log(`Error: ${error}`));
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

  const editSwitch = (index: string, ip: string, hostname: string) => {
    axios
      .put(`${SERVER_IP}/api/edit`, {
        data: { id: index, ip, name: hostname },
      })
      .then((data) => console.log(data))
      .then(() => fetchFromServer())
      .catch((error) => console.log(`Error: ${error}`));
  };

  const deleteSwitch = (ip: string) => {
    axios
      .delete(`${SERVER_IP}/api/delete`, { data: { ip } })
      .then((data) => console.log(data))
      .then(() => fetchFromServer())
      .catch((error) => console.log(`Error: ${error}`));
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
                key={x.id}
                index={x.id}
                name={x.name}
                reachability={x.reachability}
                ip={x.ip}
                isSelected={selectedIp.toString() === x.ip}
                setSelected={() => handleSelect(x.ip)}
                onPing={ping}
                onConnect={connect}
                onEdit={editSwitch}
                onDelete={deleteSwitch}
              />
            ))}
        </div>
      </div>
    </>
  );
}

export default SwitchGrid;
