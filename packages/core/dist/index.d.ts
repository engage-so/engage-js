interface Key {
    key?: string;
    secret?: string;
}
interface EventParameter {
    event: string;
    value?: string | number | Date | boolean;
    properties?: {
        [key: string]: string | number | Date | boolean;
    };
    timestamp?: string | number | Date;
}
type UserAttrParams = {
    [key: string]: string | number | Date | boolean;
};
type UserIdentifyParams = UserAttrParams & {
    id: string;
};
type Methods = 'POST' | 'PUT' | 'DELETE';
export declare function request(url: string, params: Record<string, any> | null, method: Methods): object;
export declare function init(key: Key | string): void;
export declare function identify(user: UserIdentifyParams): Promise<any>;
export declare function addAttribute(uid: string, attributes: UserAttrParams): Promise<any>;
export declare function track(uid: string, data: EventParameter): Promise<any>;
export declare function merge(sourceUid: string, destinationUid: string): Promise<any>;
export declare function addToAccount(uid: string, accountId: string, role: string): Promise<any>;
export declare function removeFromAccount(uid: string, accountId: string): Promise<any>;
export declare function changeAccountRole(uid: string, accountId: string, role: string): Promise<any>;
export declare function convertToCustomer(uid: string): Promise<any>;
export declare function convertToAccount(uid: string): Promise<any>;
export {};
//# sourceMappingURL=index.d.ts.map