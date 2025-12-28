import axios from "axios";

export interface ServerActionsValues {
    get: (url: any, onSuccess: ((response: { status?: any; data?: any }) => void), onFail: ((error: any) => void)) => void;
    post: (url: any, data: any, headers: any, onSuccess: (response: { status: any }) => void, onFail: (error: any) => void) => void;
    put: (url: any, data: any, onSuccess: (response: { status: any }) => void, onFail: (error: any) => void) => void;
    remove: (url: any, data: any, onSuccess: (response: { status: any }) => boolean, onFail: (error: any) => boolean) => Promise<boolean>
}

export enum ServerAction {
    GET, POST, PUT, DELETE
}


const useServerActions: (arg0: string) => ServerActionsValues = (serverIp: string) => {
    const get = (url: any, onSuccess: (response: {status?: any; data?: any}) => void, onFail: (error: any) => void) => {
        axios.get(`${serverIp}/${url}`)
        .then(onSuccess)
        .catch(onFail)
    }

    const post = (url: any, data: any, headers: any, onSuccess: (response: { status: number }) => void, onFail: (error: any) => void) => {
        axios.post(`${serverIp}/${url}`, data, headers)
        .then(onSuccess)
        .catch(onFail)
    }

    const put = (url: any, data: any, onSuccess: (response: { status: any }) => void, onFail: (error: any) => void) => {
        axios.put(`${serverIp}/${url}`, data)
        .then(onSuccess)
        .catch(onFail)
    }

    const remove = async (url: any, data: any, onSuccess: (response: { status: any }) => boolean, onFail: (error: any) => boolean) => {
        return await axios.delete(`${serverIp}/${url}`, data)
        .then(onSuccess)
        .catch(onFail)
    }


    return {
        get,
        post,
        put,
        remove,
    };
};

export default useServerActions;
