import { SetStateAction, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import '../styles/SwitchGrid.css';
import SwitchItem from './SwitchItem';
import TopPanel from './TopPanel';
import AlertDialog from './AlertDialog';

interface SwitchEntry {
  id: number;
  name: string;
  ip: string;
}

interface ReachableEntry {
  id: number;
  reachability: boolean;
}

function SwitchGrid(props: {
  addNotification: (message: string, color: string) => void;
}) {
  const { addNotification } = props;
  const [SERVER_IP, SetServerIp] = useState('');
  const [APP_MODE, SetAppMode] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [selectedIp, setSelectedIp] = useState('');
  const [switchList, setSwitchList] = useState<Array<SwitchEntry>>([]);
  const [reachabilityList, setReachabilityList] = useState<
    Array<ReachableEntry>
  >([]);
  const [filter, setFilter] = useState('');
  const lastNotifiedStatus = useRef<Record<string, boolean | undefined>>({});
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [itemScale, setItemScale] = useState(1);

  // Helper function to convert server error responses to human-readable messages
  const getHumanReadableError = (
    status: number,
    errorMessage?: string,
  ): string => {
    switch (status) {
      case 400:
        if (errorMessage?.includes('Missing required fields')) {
          return 'Some required information is missing.\n Please check that all fields are filled correctly.';
        }
        if (errorMessage?.includes('Invalid IPv4 address')) {
          return 'The IP address you entered is not valid.\n Please enter a valid IP address (e.g., 192.168.1.1).';
        }
        if (errorMessage?.includes('Name cannot be empty')) {
          return 'The name cannot be empty.\n Please enter a name for this device.';
        }
        return 'The information you provided is not valid.\n Please check your input and try again.';
      case 404:
        return 'The device you are trying to modify was not found.\n It may have been deleted by another user.';
      case 409:
        if (errorMessage?.includes('UNIQUE constraint')) {
          return 'A device with this IP address already exists.\n Please use a different IP address.';
        }
        return 'This action conflicts with existing data.\n The device may already exist';
      case 500:
        return 'The server encountered an unexpected error.\n Please try again later or contact support if the problem persists.';
      default:
        if (errorMessage) {
          return errorMessage;
        }
        return 'An unexpected error occurred.\n Please try again.';
    }
  };

  // Helper function to show error alert
  const showErrorAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOpen(true);
  };

  useEffect(() => {
    const readServers = async () => {
      const result = await window.electron.ipcRenderer.getVars();
      if (result.success) {
        let ip = result.content.SERVER_IP || '';
        SetAppMode(result.content.MODE);
        if (!ip.startsWith('http')) {
          ip = `http://${ip}`;
        }
        SetServerIp(ip);
        setIsReady(true);
      } else {
        console.log(result.error || 'Unknown error');
      }
    };

    readServers();
    setInterval(() => readServers(), 60 * 1000);
  }, []);

  const connect = (ip: string, reachable: boolean) => {
    console.log(ip);
    console.log(reachable);
    if (reachable) {
      if (APP_MODE === 'SWITCH') {
        window.electron.ipcRenderer.connectSSH(ip);
        return;
      }

      const lastOctet = parseInt(ip.split('.').pop() || '', 10);

      if (lastOctet > 240 && lastOctet < 255) {
        // if address between 240 and 250
        window.electron.ipcRenderer.connectSSH(ip);
      } else if (lastOctet > 0 && lastOctet < 151) {
        window.electron.ipcRenderer.connectRemotely(ip);
      } else {
        setAlertTitle('Cant connect to this device');
        setAlertMessage(
          'This device seems to be a computer and is not remotely connectable',
        );
        setAlertOpen(true);
      }
    } else {
      setAlertTitle('Device Unreachable');
      // setAlertMessage('This device is not reachable');
      setAlertOpen(true);
    }
  };

  const fetchFromServer = () => {
    axios
      .get(`${SERVER_IP}/api/getAll`)
      // eslint-disable-next-line promise/always-return
      .then((response) => {
        if (response.status === 200) {
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
        }
        return null;
      })
      // Update state with fetched data
      .catch((error) => {
        console.error('Error fetching data:', error);
        if (error.response) {
          const { status } = error.response;
          const errorMsg = error.response.data?.error || '';
          const humanReadable = getHumanReadableError(status, errorMsg);
          showErrorAlert('Failed to Load Devices', humanReadable);
        } else {
          showErrorAlert(
            'Connection Error',
            'Unable to connect to the server. Please check your connection and try again.',
          );
        }
      });
  };

  // get new switch list
  useEffect(() => {
    if (!isReady) return;

    fetchFromServer();
    setInterval(() => fetchFromServer(), 30000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const doPing = async (ip: string, visible?: boolean) => {
    if (visible) {
      await window.electron.ipcRenderer.sendPingVisible(ip);
      return;
    }
    const result = await window.electron.ipcRenderer.sendPing(ip);
    const message = updateReachability(result.ip, result.success);
    if (message) {
      // console.log(`[NOTIFY] ${message}`);
      addNotification(message, result.success === true ? 'green' : 'red');
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
        const selectedId = switchList.find((r) => r.ip === selectedIp)?.id;
        const reachability = reachabilityList.find(
          (r) => r.id === selectedId,
        )?.reachability;
        connect(selectedIp, reachability || false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIp]);

  useEffect(() => {
    const interval = setInterval(() => {
      switchList.forEach((element) => {
        doPing(element.ip);
      });
    }, 5 * 1000); // Ping every 10 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [switchList]);

  const addSwitch = (ip: any, hostname: any) => {
    axios
      .post(
        `${SERVER_IP}/api/add`,
        { ip, name: hostname },
        { headers: { 'Content-Type': 'application/json' } },
      )
      .then((response) => {
        if (response.status === 201) {
          // Only update UI if server successfully added the device
          const getMaxId = (list: any[]) => {
            return Math.max(...list.map((item) => item.id), 0);
          };
          const newId = getMaxId(switchList) + 1;
          const newSwitch = {
            id: newId,
            name: hostname,
            reachability: false,
            ip,
          };
          setSwitchList([...switchList, newSwitch]);
        }
        return null;
      })
      .catch((error) => {
        console.error('Error adding device:', error);
        if (error.response) {
          const { status } = error.response;
          const errorMsg = error.response.data?.error || '';
          const humanReadable = getHumanReadableError(status, errorMsg);
          showErrorAlert('Failed to Add Device', humanReadable);
        } else {
          showErrorAlert(
            'Connection Error',
            'Unable to connect to the server. Please check your connection and try again.',
          );
        }
      });
  };

  const editSwitch = (index: string, newIp: string, hostname: string) => {
    const numericId = Number(index);
    const previousIp = switchList.find((item) => item.id === numericId)?.ip;

    axios
      .put(`${SERVER_IP}/api/edit`, {
        id: index,
        ip: newIp,
        name: hostname,
      })
      .then((response) => {
        if (response.status === 200) {
          // Only update UI if server successfully edited the device
          setSwitchList((prevList) =>
            prevList.map((item) =>
              item.id === numericId
                ? { ...item, name: hostname, ip: newIp }
                : item,
            ),
          );

          if (previousIp && selectedIp === previousIp) {
            setSelectedIp(newIp);
          }
        }
        return null;
      })
      .catch((error) => {
        console.error('Error editing device:', error);
        if (error.response) {
          const { status } = error.response;
          const errorMsg = error.response.data?.error || '';
          const humanReadable = getHumanReadableError(status, errorMsg);
          showErrorAlert('Failed to Edit Device', humanReadable);
        } else {
          showErrorAlert(
            'Connection Error',
            'Unable to connect to the server. Please check your connection and try again.',
          );
        }
      });
  };

  const deleteSwitch = (ip: string): Promise<boolean> => {
    return axios
      .delete(`${SERVER_IP}/api/delete`, { data: { ip } })
      .then((response) => {
        if (response.status === 200) {
          // Only update UI if server successfully deleted the device
          setSwitchList(
            switchList.filter((el) => {
              return el.ip !== ip ? el : null;
            }),
          );
          return true;
        }
        return false;
      })
      .catch((error) => {
        console.error('Error deleting device:', error);
        if (error.response) {
          const { status } = error.response;
          const errorMsg = error.response.data?.error || '';
          const humanReadable = getHumanReadableError(status, errorMsg);
          showErrorAlert('Failed to Delete Device', humanReadable);
        } else {
          showErrorAlert(
            'Connection Error',
            'Unable to connect to the server. Please check your connection and try again.',
          );
        }
        return false;
      });
  };

  const handleSelect = (ip: string | SetStateAction<string>) => {
    setSelectedIp((prev) => {
      if (typeof ip === 'function') {
        // preserve ability to pass updater functions
        return (ip as any)(prev);
      }
      return prev === ip ? '' : ip;
    });
  };

  const handleWheel = (event: { deltaY: number; ctrlKey?: boolean }) => {
    if (event.ctrlKey) setItemScale((prev) => prev - event.deltaY / 10000);
  };

  const updateFilter = (data: SetStateAction<string>) => setFilter(data);

  return (
    <>
      <TopPanel addSwitch={addSwitch} updateFilter={updateFilter} />
      <div
        className="switch_div"
        onClick={() => handleSelect('')}
        onKeyDown={(e) => {
          if (e.key === 'Escape') handleSelect('');
        }}
        onWheel={handleWheel}
        role="button"
        tabIndex={0}
      >
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
                scale={itemScale}
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
      <AlertDialog
        isOpen={alertOpen}
        setIsOpen={setAlertOpen}
        title={alertTitle}
        message={alertMessage}
        onDelete={() => {}}
      />
    </>
  );
}

export default SwitchGrid;
