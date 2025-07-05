/* eslint-disable no-console */
import { SetStateAction, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import '../styles/SwitchGrid.css';
import SwitchItem from './SwitchItem';
import TopPanel from './TopPanel';

interface SwitchEntry {
  id: number;
  name: string;
  ip: string;
}

interface ReachableEntry {
  id: number;
  reachability: boolean;
}

const connect = (ip: string) => {
  if (ip.endsWith('100.254') || ip.endsWith('100.253')) {
    window.electron.ipcRenderer.connectSSH(ip);
  } else {
    window.electron.ipcRenderer.connectRemotely(ip);
  }
};

function SwitchGrid(props: { addNotification: (message: string) => void }) {
  const { addNotification } = props;
  const [SERVER_IP, SetServerIp] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [selectedIp, setSelectedIp] = useState('');
  const [switchList, setSwitchList] = useState<Array<SwitchEntry>>([]);
  const [reachabilityList, setReachabilityList] = useState<
    Array<ReachableEntry>
  >([]);
  const [filter, setFilter] = useState('');
  const lastNotifiedStatus = useRef<Record<string, boolean | undefined>>({});

  useEffect(() => {
    const readServers = async () => {
      const result = await window.electron.ipcRenderer.readServerIp();
      if (result.success) {
        let ip = result.content || '';
        if (!ip.startsWith('http')) {
          ip = `http://${ip}`;
        }
        SetServerIp(ip);
        setIsReady(true); // ✅ Signal that the next effects can run
      } else {
        console.log(result.error || 'Unknown error');
      }
    };

    readServers();
  }, []);

  const fetchFromServer = () => {
    axios
      .get(`${SERVER_IP}/api/getAll`)
      // eslint-disable-next-line promise/always-return
      .then((response) => {
        const { data } = response;
        console.log(data);

        // Set switch list
        setSwitchList(data);

        setReachabilityList((prev) => {
          if (prev.length === 0) {
            return data.map((item: SwitchEntry) => ({
              id: item.id,
              reachability: true, // or false based on your logic
            }));
          }
          return prev;
        });
      })
      // Update state with fetched data
      .catch((error) => console.error('Error fetching data:', error));
  };

  // get new switch list
  useEffect(() => {
    if (!isReady) return;

    fetchFromServer();
    setInterval(() => fetchFromServer(), 30000);
  }, [isReady]); // Empty dependency array = runs once on mount

  const updateReachability = (
    ip: string,
    newReachability: boolean,
  ): string | null => {
    const matchedSwitch = switchList.find((sw) => sw.ip === ip);
    if (!matchedSwitch) return null;

    const currentStatus = reachabilityList.find(
      (r) => r.id === matchedSwitch.id,
    );
    const lastStatus = lastNotifiedStatus.current[matchedSwitch.id];

    let notifyMessage: string | null = null;

    if (!currentStatus || currentStatus.reachability !== newReachability) {
      // Update UI state
      setReachabilityList((prevList) => {
        const updated = prevList.map((r) =>
          r.id === matchedSwitch.id
            ? { ...r, reachability: newReachability }
            : r,
        );

        if (!currentStatus) {
          return [
            ...prevList,
            { id: matchedSwitch.id, reachability: newReachability },
          ];
        }

        return updated;
      });

      // Only notify if the state actually changed since last notification
      if (lastStatus !== newReachability) {
        notifyMessage = `${matchedSwitch.name} is ${newReachability ? 'up' : 'down'}. IP is ${ip}`;
        lastNotifiedStatus.current[matchedSwitch.id] = newReachability;
      }
    }

    return notifyMessage;
  };

  const doPing = async (ip: string) => {
    const result = await window.electron.ipcRenderer.sendPing(ip);
    const message = updateReachability(result.ip, result.success);
    if (message) {
      // console.log(`[NOTIFY] ${message}`);
      addNotification(message);
    } else {
      // console.log(`[SKIP] No change for ${result.ip}`);
    }
  };

  // used for the event listener for clicked item
  useEffect(() => {
    const handleKeyDown = (event: { ctrlKey: any; key: string }) => {
      if (!selectedIp) return;

      if (event.ctrlKey && event.key === 'g') {
        doPing(selectedIp);
      } else if (event.ctrlKey && event.key === 'h') {
        connect(selectedIp);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIp]);

  useEffect(() => {
    const interval = setInterval(() => {
      switchList.forEach((element) => {
        doPing(element.ip);
      });
    }, 1000); // Ping every 10 seconds

    return () => clearInterval(interval);
  }, [switchList]);

  const addSwitch = (ip: any, hostname: any) => {
    // FOR THE NEW ID, NEED TO FETCH FROM SERVER AND GET THE MAX ID + 1

    const getMaxId = (list: any[]) => {
      return Math.max(...list.map((item) => item.id));
    };
    axios
      .get(`${SERVER_IP}/api/getAll`)
      .then((response) => response.data) // Parse JSON response
      .then((data) => {
        console.log(data);
        return data;
      })
      .then((data) => {
        const newId = getMaxId(data) + 1;
        const newSwitch = {
          id: newId,
          name: hostname,
          reachability: false,
          ip,
        };
        setSwitchList([...switchList, newSwitch]);
        return null;
      })
      .catch((error) => console.error('Error fetching data:', error));

    axios
      .post(
        `${SERVER_IP}/api/add`,
        { ip, name: hostname },
        { headers: { 'Content-Type': 'application/json' } },
      )
      .then((data) => console.log(data))
      .catch((error) => console.log(`Error: ${error}`));
  };

  const editSwitch = (index: string, ip: string, hostname: string) => {
    setSwitchList((prevList) =>
      prevList.map((item) =>
        item.ip === ip ? { ...item, name: hostname } : item,
      ),
    );

    axios
      .put(`${SERVER_IP}/api/edit`, {
        data: { id: index, ip, name: hostname },
      })
      .then((data) => console.log(data))
      .catch((error) => console.log(`Error: ${error}`));
  };

  const deleteSwitch = (ip: string) => {
    setSwitchList(
      switchList.filter((el) => {
        return el.ip !== ip ? el : null;
      }),
    );

    axios
      .delete(`${SERVER_IP}/api/delete`, { data: { ip } })
      .then((data) => console.log(data))
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
                reachability={
                  reachabilityList.find((el) => el.id === x.id)?.reachability
                }
                ip={x.ip}
                isSelected={selectedIp.toString() === x.ip}
                setSelected={() => handleSelect(x.ip)}
                onPing={doPing}
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
