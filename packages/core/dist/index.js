"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToAccount = exports.convertToCustomer = exports.changeAccountRole = exports.removeFromAccount = exports.addToAccount = exports.merge = exports.track = exports.addAttribute = exports.identify = exports.init = exports.request = void 0;
const buffer_1 = require("buffer");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const error_1 = require("./error");
if (typeof btoa === 'undefined') {
    global.btoa = function (str) {
        return buffer_1.Buffer.from(str).toString('base64');
    };
}
// type UserIdentifyParams = {
//   id: string
//   [key: string]: string | number | Date | boolean
// }
// type UserAttrParams = Omit<UserIdentifyParams, 'id'>
// const rootURL = 'https://api.engage.so/v1'
let auth = '';
const notMeta = ['created_at', 'is_account', 'number', 'device_token', 'device_platform', 'email', 'first_name', 'last_name', 'tz', 'app_version', 'app_build', 'app_last_active'];
const apiRoot = 'https://api.engage.so/v1';
function _request(url, params, method) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const o = {
                method,
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                    Authorization: `Basic ${auth}`
                },
                // throwHttpErrors: false,
                // prefixUrl: rootURL
            };
            if (params) {
                o.body = JSON.stringify(params);
            }
            // const response = await ky(url, o)
            const response = yield (0, cross_fetch_1.default)(`${apiRoot}${url}`, o);
            const body = yield response.json();
            let error = 'API connection error';
            if (!response.ok) {
                if (body && body.error) {
                    error = body.error;
                }
                return { error };
            }
            return body;
        }
        catch (e) {
            return { error: 'API connection error' };
        }
    });
}
// Alias of _request method
// Same with _request for now but can later have modifications
function request(url, params, method) {
    return _request(url, params, method);
}
exports.request = request;
function init(key) {
    if (!key) {
        throw new error_1.EngageError('You need to pass in your API key(s).');
    }
    const options = {
        key: undefined,
        secret: ''
    };
    if (typeof key === 'string') {
        options.key = key;
    }
    else {
        if (!key.key) {
            throw new error_1.EngageError('`key` missing in object.');
        }
        if (key.key) {
            options.key = `${key.key}`;
        }
        if (key.secret) {
            options.secret = `${key.secret}`;
        }
    }
    // Set auth
    // auth = Buffer.from(`${options.key}:${options.secret}`).toString('base64')
    auth = btoa(`${options.key}:${options.secret}`);
}
exports.init = init;
// Data tracking
function identify(user) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!user) {
            throw new error_1.EngageError('You need to pass an object with at least an id.');
        }
        if (!user.id) {
            throw new error_1.EngageError('ID missing.');
        }
        if (user.email && (typeof user.email !== 'string' || !/^\S+@\S+$/.test(user.email))) {
            throw new error_1.EngageError('Email invalid.');
        }
        const params = {};
        params.meta = {};
        for (const k in user) {
            if (k === 'id' || notMeta.includes(k)) {
                params[k] = user[k];
            }
            else {
                params.meta[k] = user[k];
            }
        }
        return _request(`users/${user.id}`, params, 'PUT');
    });
}
exports.identify = identify;
function addAttribute(uid, attributes) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!uid) {
            throw new error_1.EngageError('User ID missing.');
        }
        if (!attributes) {
            throw new error_1.EngageError('Attributes missing.');
        }
        if (!Object.keys(attributes).length) {
            throw new error_1.EngageError('Attributes missing.');
        }
        const params = {};
        params.meta = {};
        for (const k in attributes) {
            if (notMeta.includes(k)) {
                params[k] = attributes[k];
            }
            else {
                params.meta[k] = attributes[k];
                Object.assign(params.meta, k, attributes[k]);
            }
        }
        if (Object.keys(params.meta).length) {
            delete params.meta;
        }
        return _request(`users/${uid}`, params, 'PUT');
    });
}
exports.addAttribute = addAttribute;
function track(uid, data) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!uid) {
            throw new error_1.EngageError('User ID missing.');
        }
        if (!data) {
            throw new error_1.EngageError('Event data missing.');
        }
        if (typeof data === 'string') {
            data = {
                event: data,
                value: true
            };
        }
        else {
            if (!Object.keys(data).length) {
                throw new error_1.EngageError('Attributes missing.');
            }
        }
        return _request(`users/${uid}/events`, data, 'POST');
    });
}
exports.track = track;
function merge(sourceUid, destinationUid) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!sourceUid) {
            throw new error_1.EngageError('Source ID missing.');
        }
        if (!destinationUid) {
            throw new error_1.EngageError('Destination ID missing.');
        }
        return _request(`users/merge`, {
            source: sourceUid,
            destination: destinationUid
        }, 'POST');
    });
}
exports.merge = merge;
// Account functions
function addToAccount(uid, accountId, role) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!uid) {
            throw new error_1.EngageError('User ID missing.');
        }
        if (!accountId) {
            throw new error_1.EngageError('Account ID missing.');
        }
        if (role && typeof role !== 'string') {
            throw new error_1.EngageError('Role should be a text.');
        }
        const g = {
            id: accountId
        };
        if (role) {
            g.role = role;
        }
        return _request(`users/${uid}/accounts`, { accounts: [g] }, 'POST');
    });
}
exports.addToAccount = addToAccount;
function removeFromAccount(uid, accountId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!uid) {
            throw new error_1.EngageError('User ID missing.');
        }
        if (!accountId) {
            throw new error_1.EngageError('Account ID missing.');
        }
        return _request(`users/${uid}/accounts/${accountId}`, null, 'DELETE');
    });
}
exports.removeFromAccount = removeFromAccount;
function changeAccountRole(uid, accountId, role) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!uid) {
            throw new error_1.EngageError('User ID missing.');
        }
        if (!accountId) {
            throw new error_1.EngageError('Account ID missing.');
        }
        if (!role) {
            throw new error_1.EngageError('New role missing.');
        }
        return _request(`users/${uid}/accounts/${accountId}`, { role }, 'PUT');
    });
}
exports.changeAccountRole = changeAccountRole;
function convertToCustomer(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!uid) {
            throw new error_1.EngageError('User ID missing.');
        }
        return _request(`users/${uid}/convert`, { type: 'customer' }, 'POST');
    });
}
exports.convertToCustomer = convertToCustomer;
function convertToAccount(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!uid) {
            throw new error_1.EngageError('User ID missing.');
        }
        return _request(`users/${uid}/convert`, { type: 'account' }, 'POST');
    });
}
exports.convertToAccount = convertToAccount;
