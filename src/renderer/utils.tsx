import { JSX } from 'react';
import SwitchItem from './components/SwitchItem';

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

export class PingableList {
  private pingables: PingableEntry[] = [];

  constructor(employees: PingableEntry[]) {
    this.pingables = employees;
  }

  // Custom method to filter employees by name
  filter(filter: string): PingableEntry[] {
    return this.pingables.filter((el) => {
      if (filter === '') return el;
      if (el.ip.includes(filter)) return el;
      if (el.name.includes(filter)) return el;
      return null;
    });
  }

  buildItem(x: PingableEntry, itemProps: itemProps): JSX.Element {
    return (
      <SwitchItem
        key={x.id}
        index={x.id}
        name={x.name}
        ip={x.ip}
        scale={itemProps.itemScale}
        isServerOnline={itemProps.isServerOnline}
        reachability={itemProps.reachability(x)}
        isSelected={itemProps.isSelected(x)}
        setSelected={itemProps.setSelected(x)}
        onPing={itemProps.onPing}
        onConnect={itemProps.onConnect}
        onEdit={itemProps.onEdit}
        onDelete={itemProps.onDelete}
      />
    );
  }

  build(filter: string, props: itemProps): JSX.Element[] {
    return this.filter(filter).map((element) => this.buildItem(element, props));
  }
}

export type { ReachableEntry, PingableEntry, itemProps };
