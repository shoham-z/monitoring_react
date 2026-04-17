import { validateIPAddress } from "../../main/validation"
import { PingableEntry } from "../utils"
import { AppDataValues } from "./useAppData"
import { ItemListValues } from "./useItemList"

export type ItemSortValues = [
    (itemList: ItemListValues, eventIds: Set<number>, itemById: Map<number, PingableEntry>) => PingableEntry[],
    (itemList: ItemListValues, eventIds: Set<number>, itemById: Map<number, PingableEntry>) => PingableEntry[],
    (itemList: ItemListValues, eventIds: Set<number>, itemById: Map<number, PingableEntry>) => PingableEntry[],
    (itemList: ItemListValues, eventIds: Set<number>, itemById: Map<number, PingableEntry>) => PingableEntry[]
]

const lastOctet = (ip: string) => {
    if(validateIPAddress(ip) !== ip) return -1;

    return Number(ip.split('.')[3]);
}

const useItemSort: (arg0: AppDataValues) => ItemSortValues = (appData: AppDataValues) => {
    // used to get items with new events
    const getNewEventItem = (itemList: ItemListValues, eventIds: Set<number>, itemById: Map<number, PingableEntry>): PingableEntry[] =>
        itemList.list.filter((item) => eventIds.has(item.id));

    // Items that are reachable but have no new events
    const getUpItems = (itemList: ItemListValues, eventIds: Set<number>, itemById: Map<number, PingableEntry>): PingableEntry[] =>
        itemList.reachabilityList
            .filter(
                (r) => !eventIds.has(r.id) && r.missedPings < appData.maxMissedPings,
            )
        .map((r) => itemById.get(r.id))
        .filter(Boolean) as PingableEntry[];

    // Items that are unreachable but have no new events
    const getDownItems = (itemList: ItemListValues, eventIds: Set<number>, itemById: Map<number, PingableEntry>): PingableEntry[] =>
        itemList.reachabilityList
        .filter(
            (r) => !eventIds.has(r.id) && (r.missedPings >= appData.maxMissedPings),
        )
        .map((r) => itemById.get(r.id))
        .filter(Boolean) as PingableEntry[];


    const getRamleCoreItems = (itemList: ItemListValues, eventIds: Set<number>, itemById: Map<number, PingableEntry>) => {

        const filterByIP = (l: PingableEntry[]) => l.filter((item) => item.location === 'Ramle');

        const list1 = filterByIP(getNewEventItem(itemList, eventIds, itemById));
        const list2 = filterByIP(getDownItems(itemList, eventIds, itemById));
        const list3 = filterByIP(getUpItems(itemList, eventIds, itemById));

        return [ ...list1, ...list2, ...list3];
    }

    const getOfaritCoreItems = (itemList: ItemListValues, eventIds: Set<number>, itemById: Map<number, PingableEntry>) => {

        const filterByIP = (l: PingableEntry[]) => l.filter((item) => item.location === 'Ofarit');

        const list1 = filterByIP(getNewEventItem(itemList, eventIds, itemById));
        const list2 = filterByIP(getDownItems(itemList, eventIds, itemById));
        const list3 = filterByIP(getUpItems(itemList, eventIds, itemById));

        return [ ...list1, ...list2, ...list3];
    }

    const getRemoteSiteItems = (itemList: ItemListValues, eventIds: Set<number>, itemById: Map<number, PingableEntry>) => {

        const filterByIP = (l: PingableEntry[]) => l.filter((item) => item.location === 'Nafa');

        const list1 = filterByIP(getNewEventItem(itemList, eventIds, itemById));
        const list2 = filterByIP(getDownItems(itemList, eventIds, itemById));
        const list3 = filterByIP(getUpItems(itemList, eventIds, itemById));

        return [ ...list1, ...list2, ...list3];
    }

    const getUnknownLocationItems = (itemList: ItemListValues, eventIds: Set<number>, itemById: Map<number, PingableEntry>) => {

    const filterByIP = (l: PingableEntry[]) => l.filter((item) => !['Ramle', 'Ofarit', 'Nafa'].includes(item.location));

    const list1 = filterByIP(getNewEventItem(itemList, eventIds, itemById));
    const list2 = filterByIP(getDownItems(itemList, eventIds, itemById));
    const list3 = filterByIP(getUpItems(itemList, eventIds, itemById));

    return [ ...list1, ...list2, ...list3];
    }

    const switchMode: ItemSortValues = [getNewEventItem, getDownItems, getUpItems, () => []];
    const encryptorMode: ItemSortValues = [getRamleCoreItems, getOfaritCoreItems, getRemoteSiteItems, getUnknownLocationItems];

    return appData.appMode === "SWITCH" ? switchMode : encryptorMode;
};

export default useItemSort;
