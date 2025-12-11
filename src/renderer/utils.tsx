import { JSX } from 'react';
import GridItem from './components/GridItem';

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

  constructor(pingables: PingableEntry[]) {
    this.pingables = pingables;
  }

  // Custom method to filter pingables by name/ip
  filter(filter: string): PingableEntry[] {
    return this.pingables.filter((el) => {
      if (filter === '') return el;
      if (el.ip.includes(filter)) return el;
      if (el.name.includes(filter)) return el;
      return null;
    });
  }

  build(filter: string, props: itemProps): JSX.Element[] {
    return this.filter(filter).map((element) => (
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
  }
}

export type { ReachableEntry, PingableEntry, itemProps };
