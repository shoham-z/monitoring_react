import { validateIPAddress } from "../../main/validation"
import { PingableEntry } from "../utils"
import { AppDataValues } from "./useAppData"
import { ItemListValues } from "./useItemList"

export interface ServerActionsValues {
    get: () => {}
    post: () => {}
    put: () => {}
    remove: () => {}
}

const lastOctet = (ip: string) => {
    if(validateIPAddress(ip) !== ip) return -1;

    return Number(ip.split('.')[3]);
}

const useItemSort = (appData: AppDataValues) => {



    // used to get items with new events
    const getNewEventItem = (itemList: ItemListValues, eventIds: Set<number>): PingableEntry[] => 
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
            (r) => !eventIds.has(r.id) && r.missedPings >= appData.maxMissedPings,
        )
        .map((r) => itemById.get(r.id))
        .filter(Boolean) as PingableEntry[];


    const getRamleCoreItems = (itemList: ItemListValues, eventIds: Set<number>, itemById: Map<number, PingableEntry>) => {
        
        const filterByIP = (l: PingableEntry[]) => l.filter((item) => 50 > lastOctet(item.ip) && lastOctet(item.ip) > 0);

        const list1 = filterByIP(getDownItems(itemList, eventIds, itemById))
        const list2 = filterByIP(getUpItems(itemList, eventIds, itemById))

        return [ ...list1, ...list2];
    }
    
    const getOfaritCoreItems = (itemList: ItemListValues, eventIds: Set<number>, itemById: Map<number, PingableEntry>) => {

        const filterByIP = (l: PingableEntry[]) => l.filter((item) => 100 > lastOctet(item.ip) && lastOctet(item.ip) > 50);

        const list1 = filterByIP(getDownItems(itemList, eventIds, itemById))
        const list2 = filterByIP(getUpItems(itemList, eventIds, itemById))

        return [ ...list1, ...list2];
    }

    const getRemoteSiteItems = (itemList: ItemListValues, eventIds: Set<number>, itemById: Map<number, PingableEntry>) => {
        
        const filterByIP = (l: PingableEntry[]) => l.filter((item) => 150 > lastOctet(item.ip) && lastOctet(item.ip) > 100);

        const list1 = filterByIP(getDownItems(itemList, eventIds, itemById))
        const list2 = filterByIP(getUpItems(itemList, eventIds, itemById))

        return [ ...list1, ...list2];
    }

    const get = () => {};

    const post = () => {};

    const put = () => {};

    const remove = () => {};

    return {
        get,
        post,
        put,
        remove,
    };
};

export default useItemSort;
