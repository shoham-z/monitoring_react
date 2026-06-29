import {
  SetStateAction,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import '../styles/Grid.css';
import { useTranslation } from 'react-i18next';
import TopPanel from './TopPanel';
import AlertDialog from './AlertDialog';
import { MyNotification } from '../../main/util';
import { PingableEntry, ReachableEntry, itemProps } from '../utils';
import useAppData, { AppDataValues } from '../hooks/useAppData';
import useItemList, { ReachabilityEvent } from '../hooks/useItemList';
import ItemListView from './ItemListView';

function Grid(props: {
  addNotification: (
    swId: number,
    color?: string,
    name?: string,
    ip?: string,
    messageKey?: string,
    messageParams?: Record<string, string | number>,
  ) => void;
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
    itemList.list.forEach((item) => {
      map.set(item.id, item);
    });
    return map;
  }, [itemList.list]);

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

  const { t } = useTranslation();

  // shows error if occurs inside 'ItemList'
  useEffect(() => {
    if (itemList.error) {
      showErrorAlert(itemList.error.title, itemList.error.message);
    }
  }, [itemList.error]);

  // connects to an item using ip
  const onConnect = (ip: string, reachable: boolean) => {
    if (reachable) {
      if (appData.appMode === 'SWITCH') {
        window.electron.ipcRenderer.connectSSH(ip);
        return;
      }

      window.electron.ipcRenderer.connectRemotely(ip);
    } else {
      setAlertTitle(t('deviceUnreachable'));
      setAlertMessage('');
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

      const response = await window.electron.ipcRenderer.sendPing(ip);
      const result: ReachabilityEvent = itemList.updateReachability(
        ip,
        response.success,
      );

      const item = itemById.get(result.id);
      if (!item) return;

      const notificationColor = result.status === 'UP' ? 'green' : 'red';
      const messageKey = result.status === 'UP' ? 'deviceStatusUp' : 'deviceStatusDown';
      addNotification(
        item.id,
        notificationColor,
        item.name,
        item.ip,
        messageKey,
      );
    },
    [itemList, itemById, addNotification, t],
  );

  // used for the global event to ping all devices
  useEffect(() => {
    const unsubscribe = window.electron.ipcRenderer.pingAllDevices(() => {
      itemList.list.forEach((element) => {
        onPing(element.ip, true);
      });
    });
    return () => {
      unsubscribe();
    };
  }, [itemList.list, addNotification, onPing]);

  // used for the event listener for clicked item
  useEffect(() => {
    const handleKeyDown = (event: { ctrlKey: any; key: string }) => {
      if (!itemList.selecteditemIP) return;

      if (event.ctrlKey && event.key === 'g') {
        onPing(itemList.selecteditemIP, true);
      } else if (event.ctrlKey && event.key === 'h') {
        const selectedId = itemList.list.find(
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
    itemList.list,
    itemList.reachabilityList,
    itemList.selecteditemIP,
    onPing,
  ]);

  // used to send pings to the devices every 15 seconds
  useEffect(() => {
    const sendPings = () => {
      itemList.list.forEach((element) => {
        onPing(element.ip);
      });
    };
    const interval = setInterval(() => {
      sendPings();
    }, 15 * 1000); // Ping every 15 seconds

    sendPings(); // Initial ping on setup
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemList.list]);

  // used to handle zooming in/out
  const handleWheel = (event: { deltaY: number; ctrlKey?: boolean }) => {
    if (event.ctrlKey) setItemScale((prev) => prev - event.deltaY / 10000);
  };

  // used to update filter in search bar
  const updateFilter = (data: SetStateAction<string>) => setFilter(data);

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
        network={appData.network}
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
        <ItemListView
          itemList={itemList}
          eventIds={eventIds}
          itemById={itemById}
          appData={appData}
          customProps={customProps}
          filter={filter}
        />
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
