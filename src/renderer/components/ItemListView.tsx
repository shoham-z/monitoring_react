import { JSX } from 'react';
import { AppDataValues } from '../hooks/useAppData';
import { ItemListValues } from '../hooks/useItemList';
import { itemProps, PingableEntry } from '../utils';
import GridItem from './GridItem';
import useItemSort, { ItemSortValues } from '../hooks/useItemSort';

const buildGridItems = (
  items: PingableEntry[],
  filter: string,
  props: itemProps,
  appData: AppDataValues,
): JSX.Element[] => {
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
        appData={appData}
      />
    ));
};

function ItemListView(props: {
  itemList: ItemListValues;
  eventIds: Set<number>;
  itemById: Map<number, PingableEntry>;
  appData: AppDataValues;
  customProps: itemProps;
  filter: string;
}) {
  const { itemList, eventIds, itemById, appData, customProps, filter } = props;

  const sortFunctions: ItemSortValues = useItemSort(appData);

  const switchTexts = [
    'Devices With New Events',
    'Unreachable Devices',
    'Reachable Devices',
  ];

  const encryptorTexts = ['Ramle Encryptor', 'Ofarit Encryptor', 'Nafot'];

  const texts = appData.appMode === 'SWITCH' ? switchTexts : encryptorTexts;

  return (
    <div>
      <div className="container_flex" id="container_flex">
        <p className="div_header">
          <span>{texts[0]}</span>
        </p>
        {buildGridItems(
          sortFunctions[0](itemList, eventIds, itemById),
          filter,
          customProps,
          appData,
        )}
      </div>
      <div className="container_flex" id="container_flex">
        <p className="div_header">
          <span>{texts[1]}</span>
        </p>
        {buildGridItems(
          sortFunctions[1](itemList, eventIds, itemById),
          filter,
          customProps,
          appData,
        )}
      </div>
      <div className="container_flex" id="container_flex">
        <p className="div_header">
          <span>{texts[2]}</span>
        </p>
        {buildGridItems(
          sortFunctions[2](itemList, eventIds, itemById),
          filter,
          customProps,
          appData,
        )}
      </div>
    </div>
  );
}

export default ItemListView;
