import { SetStateAction, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import '../styles/SwitchGrid.css';
import SwitchItem from './SwitchItem';
import TopPanel from './TopPanel';
import AlertDialog from './AlertDialog';
import { Notification } from '../../main/util';

interface SwitchEntry {
  id: number;
  name: string;
  ip: string;
}

interface ReachableEntry {
  id: number;
  missedPings: number;
}

function SwitchGrid(props: {
  addNotification: (message: string, swId: number, color: string) => void;
  notifications: Notification[];
}) {
  const { addNotification, notifications } = props;
  const [SERVER_IP, SetServerIp] = useState('');
  const [APP_MODE, SetAppMode] = useState('');
  const [MAX_MISSED_PINGS, setMaxMissedPings] = useState(3);
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
  const [isServerOnline, setIsServerOnline] = useState(false);
  const missedPingsRef = useRef<Record<string, number>>({});

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

  // Initial setup to get server IP and app mode
  useEffect(() => {
    const initialSetup = async () => {
      const result = await window.electron.ipcRenderer.getVars();
      if (result.success) {
        let ip = result.content.SERVER_IP || '';
        SetAppMode(result.content.MODE);
        setMaxMissedPings(result.content.MAX_MISSED_PINGS || 3);
        if (!ip.startsWith('http')) {
          ip = `http://${ip}`;
        }
        SetServerIp(ip);
        setIsReady(true);
      } else {
        // console.log(result.error || 'Unknown error');
      }
    };

    initialSetup();
    setInterval(() => initialSetup(), 60 * 1000);
  }, []);

  const connect = (ip: string, reachable: boolean) => {
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

  const loadFromLocalStorage = async () => {
    try {
      const result = await window.electron.ipcRenderer.loadSwitchList();
      if (result.success && result.content && result.content.length > 0) {
        setSwitchList(result.content);
        setReachabilityList((prev) => {
          if (prev.length === 0) {
            return result.content.map((item: SwitchEntry) => ({
              id: item.id,
              missedPings: 0,
            }));
          }
          return prev;
        });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const saveToLocalStorage = async (switches: Array<SwitchEntry>) => {
    // TODO: handle errors here
    try {
      const result = await window.electron.ipcRenderer.saveSwitchList(switches);
      if (result.success) {
        console.log('Saved switch list to local storage');
      } else {
        console.error('Failed to save switch list:', result.error);
      }
    } catch (error) {
      console.error('Error saving to local storage:', error);
    }
  };

  const fetchFromServer = () => {
    axios
      .get(`${SERVER_IP}/api/getAll`)
      // eslint-disable-next-line promise/always-return
      .then((response) => {
        if (response.status === 200) {
          const { data } = response;

          // Set switch list
          setSwitchList(data);

          // Save to local storage for offline use
          saveToLocalStorage(data);

          // Mark server as online
          setIsServerOnline(true);

          setReachabilityList((prev) => {
            if (prev.length === 0) {
              return data.map((item: SwitchEntry) => ({
                id: item.id,
                missedPings: 0,
              }));
            }
            return prev;
          });
        }
        return null;
      })
      // Update state with fetched data
      .catch(async (error) => {
        // Mark server as offline
        setIsServerOnline(false);
        // Try to load from local storage as fallback
        const loaded = await loadFromLocalStorage();
        if (loaded) {
          // Don't show error if we successfully loaded from cache
          return;
        }
        // Only show error if we couldn't load from cache either
        if (error.response) {
          const { status } = error.response;
          const errorMsg = error.response.data?.error || '';
          const humanReadable = getHumanReadableError(status, errorMsg);
          showErrorAlert('Failed to Load Devices', humanReadable);
        } else {
          showErrorAlert(
            'Connection Error',
            'Unable to connect to the server. Using cached data if available.',
          );
        }
      });
  };

  // Load from local storage on startup
  useEffect(() => {
    if (!isReady) return;

    // Try to load from local storage first for immediate display
    loadFromLocalStorage();

    // Then try to fetch from server (will update if successful)
    fetchFromServer();
    const interval = setInterval(() => fetchFromServer(), 30000);

    // eslint-disable-next-line consistent-return
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]); // Empty dependency array = runs once on mount

  const updateReachability = (
    ip: string,
    pingSuccess: boolean,
  ): string | null => {
    const matchedSwitch = switchList.find((sw) => sw.ip === ip);
    if (!matchedSwitch) return null;

    const { id } = matchedSwitch;
    const prev = missedPingsRef.current[id] ?? 0;
    const newMissedPings = pingSuccess ? 0 : prev + 1;
    missedPingsRef.current[id] = newMissedPings;

    // keep UI state in sync (optional) — update once for display
    setReachabilityList((prevList) => {
      const found = prevList.some((r) => r.id === id);
      const mapped = prevList.map((r) =>
        r.id === id ? { ...r, missedPings: newMissedPings } : r,
      );
      if (!found) return [...mapped, { id, missedPings: newMissedPings }];
      return mapped;
    });

    const lastStatus = lastNotifiedStatus.current[id];
    let notifyMessage: string | null = null;

    if (pingSuccess) {
      if (lastStatus !== true) {
        notifyMessage = `${matchedSwitch.name} is up. IP is ${ip}`;
        lastNotifiedStatus.current[id] = true;
      }
    } else if (newMissedPings >= MAX_MISSED_PINGS && lastStatus !== false) {
      notifyMessage = `${matchedSwitch.name} is down. IP is ${ip}`;
      lastNotifiedStatus.current[id] = false;
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
      addNotification(
        message,
        switchList.find((r) => r.ip === result.ip)?.id || 0,
        result.success === true ? 'green' : 'red',
      );
    } else {
      // console.log(`[SKIP] No change for ${result.ip}`);
    }
  };

  // used for the global event to ping all devices
  useEffect(() => {
    window.electron.ipcRenderer.pingAllDevices(() => {
      const sendPings = () => {
        switchList.forEach((element) => {
          doPing(element.ip, true);
        });
      };
      sendPings();
    });
    return () => {
      window.electron.ipcRenderer.pingAllDevices(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [switchList]);

  // used for the event listener for clicked item
  useEffect(() => {
    const handleKeyDown = (event: { ctrlKey: any; key: string }) => {
      if (!selectedIp) return;

      if (event.ctrlKey && event.key === 'g') {
        doPing(selectedIp);
      } else if (event.ctrlKey && event.key === 'h') {
        const selectedId = switchList.find((r) => r.ip === selectedIp)?.id;
        const missedPings = reachabilityList.find(
          (r) => r.id === selectedId,
        )?.missedPings;
        connect(selectedIp, missedPings === 0 || false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIp]);

  useEffect(() => {
    const sendPings = () => {
      switchList.forEach((element) => {
        doPing(element.ip);
      });
    };
    const interval = setInterval(() => {
      sendPings();
    }, 15 * 1000); // Ping every 15 seconds

    sendPings(); // Initial ping on setup
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [switchList]);

  const addSwitch = (ip: any, hostname: any) => {
    if (!isServerOnline) {
      showErrorAlert(
        'Server Offline',
        'Cannot add devices while the server is offline. Please wait for the server to come back online.',
      );
      return;
    }

    axios
      .post(
        `${SERVER_IP}/api/add`,
        { ip, name: hostname },
        { headers: { 'Content-Type': 'application/json' } },
      )
      .then((response) => {
        if (response.status === 201) {
          // Mark server as online
          setIsServerOnline(true);
          // Only update UI if server successfully added the device
          const getMaxId = (list: any[]) => {
            return Math.max(...list.map((item) => item.id), 0);
          };
          const newId = getMaxId(switchList) + 1;
          const newSwitch = {
            id: newId,
            name: hostname,
            ip,
          };
          const updatedList = [...switchList, newSwitch];
          setSwitchList(updatedList);
          // Save to local storage
          saveToLocalStorage(updatedList);
        }
        return null;
      })
      .catch((error) => {
        // Mark server as offline on connection error
        if (error.response) {
          const { status } = error.response;
          const errorMsg = error.response.data?.error || '';
          const humanReadable = getHumanReadableError(status, errorMsg);
          showErrorAlert('Failed to Add Device', humanReadable);
        } else {
          setIsServerOnline(false);
          showErrorAlert(
            'Connection Error',
            'Unable to connect to the server. Please check your connection and try again.',
          );
        }
      });
  };

  const editSwitch = (index: string, newIp: string, hostname: string) => {
    if (!isServerOnline) {
      showErrorAlert(
        'Server Offline',
        'Cannot edit devices while the server is offline. Please wait for the server to come back online.',
      );
      return;
    }

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
          // Mark server as online
          setIsServerOnline(true);
          // Only update UI if server successfully edited the device
          setSwitchList((prevList) => {
            const updatedList = prevList.map((item) =>
              item.id === numericId
                ? { ...item, name: hostname, ip: newIp }
                : item,
            );
            // Save to local storage
            saveToLocalStorage(updatedList);
            return updatedList;
          });

          if (previousIp && selectedIp === previousIp) {
            setSelectedIp(newIp);
          }
        }
        return null;
      })
      .catch((error) => {
        // Mark server as offline on connection error
        if (error.response) {
          const { status } = error.response;
          const errorMsg = error.response.data?.error || '';
          const humanReadable = getHumanReadableError(status, errorMsg);
          showErrorAlert('Failed to Edit Device', humanReadable);
        } else {
          setIsServerOnline(false);
          showErrorAlert(
            'Connection Error',
            'Unable to connect to the server. Please check your connection and try again.',
          );
        }
      });
  };

  const deleteSwitch = (ip: string): Promise<boolean> => {
    if (!isServerOnline) {
      showErrorAlert(
        'Server Offline',
        'Cannot delete devices while the server is offline. Please wait for the server to come back online.',
      );
      return Promise.resolve(false);
    }

    return axios
      .delete(`${SERVER_IP}/api/delete`, { data: { ip } })
      .then((response) => {
        if (response.status === 200) {
          // Mark server as online
          setIsServerOnline(true);
          // Only update UI if server successfully deleted the device
          const updatedList = switchList.filter((el) => {
            return el.ip !== ip ? el : null;
          });
          setSwitchList(updatedList);
          // Save to local storage
          saveToLocalStorage(updatedList);
          return true;
        }
        return false;
      })
      .catch((error) => {
        // Mark server as offline on connection error
        if (error.response) {
          const { status } = error.response;
          const errorMsg = error.response.data?.error || '';
          const humanReadable = getHumanReadableError(status, errorMsg);
          showErrorAlert('Failed to Delete Device', humanReadable);
        } else {
          setIsServerOnline(false);
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

  const getNewEventSwitches = () => {
    const ids = notifications.map((n) => n.swId);
    return switchList.filter((sw) => ids.includes(sw.id));
  };

  const getNoEventSwitchId = () => {
    const ids = notifications.map((n) => n.swId);
    const l = switchList
      .filter((sw) => !ids.includes(sw.id))
      .map((el) => el.id);
    return l;
  };

  const getUpSwitches = () => {
    const idList = getNoEventSwitchId();
    return reachabilityList
      .filter((el) => idList.includes(el.id))
      .filter((el) => el.missedPings < MAX_MISSED_PINGS)
      .map((el) => {
        const chosenElement = switchList.find((sw) => sw.id === el.id);
        return chosenElement;
      })
      .filter((el) => el !== undefined) as SwitchEntry[];
  };

  const getDownSwitches = () => {
    const idList = getNoEventSwitchId();
    return reachabilityList
      .filter((el) => idList.includes(el.id))
      .filter((el) => el.missedPings >= MAX_MISSED_PINGS)
      .map((el) => {
        const chosenElement = switchList.find((sw) => sw.id === el.id);
        return chosenElement;
      })
      .filter((el) => el !== undefined) as SwitchEntry[];
  };

  return (
    <>
      <TopPanel
        addSwitch={addSwitch}
        updateFilter={updateFilter}
        isServerOnline={isServerOnline}
      />
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
          <p className="div_header">
            <span>Devices With New Events</span>
          </p>
          {getNewEventSwitches()
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
                  (reachabilityList.find((el) => el.id === x.id)?.missedPings ||
                    0) < MAX_MISSED_PINGS
                }
                ip={x.ip}
                scale={itemScale}
                isSelected={selectedIp.toString() === x.ip}
                setSelected={() => handleSelect(x.ip)}
                onPing={doPing}
                onConnect={connect}
                onEdit={editSwitch}
                onDelete={deleteSwitch}
                isServerOnline={isServerOnline}
              />
            ))}
        </div>
        <div className="container_flex" id="container_flex">
          <p className="div_header">
            <span>Unreachable Devices</span>
          </p>
          {getDownSwitches()
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
                  (reachabilityList.find((el) => el.id === x.id)?.missedPings ||
                    0) < MAX_MISSED_PINGS
                }
                ip={x.ip}
                scale={itemScale}
                isSelected={selectedIp.toString() === x.ip}
                setSelected={() => handleSelect(x.ip)}
                onPing={doPing}
                onConnect={connect}
                onEdit={editSwitch}
                onDelete={deleteSwitch}
                isServerOnline={isServerOnline}
              />
            ))}
        </div>
        <div className="container_flex" id="container_flex">
          <p className="div_header">
            <span>Reachable Devices</span>
          </p>
          {getUpSwitches()
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
                  (reachabilityList.find((el) => el.id === x.id)?.missedPings ||
                    0) < MAX_MISSED_PINGS
                }
                ip={x.ip}
                scale={itemScale}
                isSelected={selectedIp.toString() === x.ip}
                setSelected={() => handleSelect(x.ip)}
                onPing={doPing}
                onConnect={connect}
                onEdit={editSwitch}
                onDelete={deleteSwitch}
                isServerOnline={isServerOnline}
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
