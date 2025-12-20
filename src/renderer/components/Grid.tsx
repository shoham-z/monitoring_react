import {
  SetStateAction,
  useEffect,
  useState,
  JSX,
  useMemo,
  useCallback,
} from 'react';
import '../styles/Grid.css';
import TopPanel from './TopPanel';
import AlertDialog from './AlertDialog';
import { MyNotification } from '../../main/util';
import { PingableEntry, ReachableEntry, itemProps } from '../utils';
import useAppData, { AppDataValues } from '../hooks/useAppData';
import GridItem from './GridItem';
import useItemList from '../hooks/useItemList';

const buildGridItems = (
  items: PingableEntry[],
  filter: string,
  props: itemProps,
): JSX.Element[] => {
  console.log(items);
  return items
    .filter((item) => {
      if (!filter) return true;
      return item.ip.includes(filter) || item.name.includes(filter);
    })
    .map((element) => (
      <GridItem
        key={element.id}
        index={element.id}
        name={element.name}
        ip={element.ip}
        scale={props.itemScale}
        isServerOnline={props.isServerOnline}
        reachability={props.reachability(element)}
        isSelected={props.isSelected(element)}
        setSelected={props.setSelected(element)}
        onPing={props.onPing}
        onConnect={props.onConnect}
        onEdit={props.onEdit}
        onDelete={props.onDelete}
      />
    ));
};

function Grid(props: {
  addNotification: (message: string, swId: number, color: string) => void;
  notifications: MyNotification[];
}) {
  const { addNotification, notifications } = props;

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  // Helper function to show error alert
  const showErrorAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOpen(true);
  };

  // Initial setup to get server IP and app mode
  const appData: AppDataValues = useAppData();
  useEffect(() => {
    if (appData.error) {
      showErrorAlert(appData.error.title, appData.error.message);
    }
  }, [appData.error]);

  const [filter, setFilter] = useState('');
  const [itemScale, setItemScale] = useState(1);

  const itemList = useItemList(appData);

  const itemById = useMemo(() => {
    const map = new Map<number, PingableEntry>();
    itemList.ItemList.forEach((item) => {
      map.set(item.id, item);
    });
    return map;
  }, [itemList.ItemList]);

  const reachabilityById = useMemo(() => {
    const map = new Map<number, ReachableEntry>();
    itemList.reachabilityList.forEach((r) => {
      map.set(r.id, r);
    });
    return map;
  }, [itemList.reachabilityList]);

  const eventIds = useMemo(
    () => new Set(notifications.map((e) => e.swId)),
    [notifications],
  );

  // shows error if occurs inside 'ItemList'
  useEffect(() => {
    if (itemList.error) {
      showErrorAlert(itemList.error.title, itemList.error.message);
    }
  }, [itemList.error]);

  // send new notifications if needed
  useEffect(() => {
    if (itemList.reachabilityEvents.length === 0) return;

    itemList.reachabilityEvents.forEach((event) => {
      const item = itemById.get(event.id);
      if (!item) return;

      addNotification(
        `${item.name} is ${event.status === 'UP' ? 'up' : 'down'}`,
        item.id,
        event.status === 'UP' ? 'green' : 'red',
      );
    });

    itemList.clearReachabilityEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemList.reachabilityEvents, itemById, addNotification]);

  // connects to an item using ip
  const onConnect = (ip: string, reachable: boolean) => {
    if (reachable) {
      if (appData.appMode === 'SWITCH') {
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

  // used to send pings to items
  const onPing = useCallback(
    async (ip: string, visible?: boolean) => {
      if (visible) {
        window.electron.ipcRenderer.sendPingVisible(ip);
        return;
      }

      const result = await window.electron.ipcRenderer.sendPing(ip);
      itemList.updateReachability(ip, result.success);
    },
    [itemList],
  );

  // used for the global event to ping all devices
  useEffect(() => {
    const unsubscribe = window.electron.ipcRenderer.pingAllDevices(() => {
      itemList.ItemList.forEach((element) => {
        onPing(element.ip, true);
      });
    });
    return () => {
      unsubscribe();
    };
  }, [itemList.ItemList, addNotification, onPing]);

  // used for the event listener for clicked item
  useEffect(() => {
    const handleKeyDown = (event: { ctrlKey: any; key: string }) => {
      if (!itemList.selecteditemIP) return;

      if (event.ctrlKey && event.key === 'g') {
        onPing(itemList.selecteditemIP);
      } else if (event.ctrlKey && event.key === 'h') {
        const selectedId = itemList.ItemList.find(
          (item) => item.ip === itemList.selecteditemIP,
        )?.id;
        const missedPings = itemList.reachabilityList.find(
          (item) => item.id === selectedId,
        )?.missedPings;
        onConnect(itemList.selecteditemIP, missedPings === 0 || false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    itemList.ItemList,
    itemList.reachabilityList,
    itemList.selecteditemIP,
    onPing,
  ]);

  // used to send pings to the devices every 15 seconds
  useEffect(() => {
    const sendPings = () => {
      itemList.ItemList.forEach((element) => {
        onPing(element.ip);
      });
    };
    const interval = setInterval(() => {
      sendPings();
    }, 15 * 1000); // Ping every 15 seconds

    sendPings(); // Initial ping on setup
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemList.ItemList]);

  // used to handle zooming in/out
  const handleWheel = (event: { deltaY: number; ctrlKey?: boolean }) => {
    if (event.ctrlKey) setItemScale((prev) => prev - event.deltaY / 10000);
  };

  // used to update filter in search bar
  const updateFilter = (data: SetStateAction<string>) => setFilter(data);

  // used to get items with new events
  const getNewEventItem = (): PingableEntry[] =>
    itemList.ItemList.filter((item) => eventIds.has(item.id));

  // Items that are reachable but have no new events
  const getUpItems = (): PingableEntry[] =>
    itemList.reachabilityList
      .filter(
        (r) => !eventIds.has(r.id) && r.missedPings < appData.maxMissedPings,
      )
      .map((r) => itemById.get(r.id))
      .filter(Boolean) as PingableEntry[];

  // Items that are unreachable but have no new events
  const getDownItems = (): PingableEntry[] =>
    itemList.reachabilityList
      .filter(
        (r) => !eventIds.has(r.id) && r.missedPings >= appData.maxMissedPings,
      )
      .map((r) => itemById.get(r.id))
      .filter(Boolean) as PingableEntry[];

  const reachability = (item: PingableEntry) => {
    const entry = reachabilityById.get(item.id);
    return (entry?.missedPings ?? 0) < appData.maxMissedPings;
  };

  const isSelected = (item: PingableEntry) =>
    itemList.selecteditemIP.toString() === item.ip;

  const setSelected = (item: PingableEntry) => () =>
    itemList.handleSelect(item.ip);

  const customProps: itemProps = {
    itemScale,
    isServerOnline: itemList.isServerOnline,
    reachability,
    isSelected,
    setSelected,
    onPing,
    onConnect,
    onEdit: itemList.editItem,
    onDelete: itemList.deleteItem,
  };

  return (
    <>
      <TopPanel
        addItem={itemList.addItem}
        updateFilter={updateFilter}
        isServerOnline={itemList.isServerOnline}
      />
      <div
        className="switch_div"
        onClick={() => itemList.handleSelect('')}
        onKeyDown={(e) => {
          if (e.key === 'Escape') itemList.handleSelect('');
        }}
        onWheel={handleWheel}
        role="button"
        tabIndex={0}
      >
        <div className="container_flex" id="container_flex">
          <p className="div_header">
            <span>Devices With New Events</span>
          </p>
          {buildGridItems(getNewEventItem(), filter, customProps)}
        </div>
        <div className="container_flex" id="container_flex">
          <p className="div_header">
            <span>Unreachable Devices</span>
          </p>
          {buildGridItems(getDownItems(), filter, customProps)}
        </div>
        <div className="container_flex" id="container_flex">
          <p className="div_header">
            <span>Reachable Devices</span>
          </p>
          {buildGridItems(getUpItems(), filter, customProps)}
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

export default Grid;
