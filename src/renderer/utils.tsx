interface errorFormat {
  title: string;
  message: string;
}

interface PingableEntry {
  id: number;
  name: string;
  ip: string;
}

interface ReachableEntry {
  id: number;
  missedPings: number;
}

interface itemProps {
  itemScale: number;
  isServerOnline: boolean;
  reachability: (arg0: PingableEntry) => boolean;
  isSelected: (arg0: PingableEntry) => boolean;
  setSelected: (arg0: PingableEntry) => () => void;
  onPing: (ip: string, visible?: boolean | undefined) => Promise<void>;
  onConnect: (ip: string, reachable: boolean) => void;
  onEdit: (index: string, newIp: string, hostname: string) => void;
  onDelete: (ip: string) => Promise<boolean>;
}

export type { errorFormat, PingableEntry, ReachableEntry, itemProps };
