import { Buffer } from 'buffer'
import fetch from 'cross-fetch'
import { EngageError } from './error'

if (typeof btoa === 'undefined') {
  global.btoa = function (str) {
    return Buffer.from(str).toString('base64')
  }
}

interface Key {
  key?: string
  secret?: string
}
interface EventParameter {
  event: string
  value?: string | number | Date | boolean
  properties?: {
    [key: string]: string | number | Date | boolean
  }
  timestamp?: string | number | Date
}
type UserAttrParams = {
  [key: string]: string | number | Date | boolean
}
type UserIdentifyParams = UserAttrParams & { id: string }
type DataParameters = {
  [key: string]: string | number | Date | boolean
} & {
  meta?: {
    [key: string]: string | number | Date | boolean
  }
}
type Methods = 'POST' | 'PUT' | 'DELETE'
// type UserIdentifyParams = {
//   id: string
//   [key: string]: string | number | Date | boolean
// }
// type UserAttrParams = Omit<UserIdentifyParams, 'id'>

const rootURL = 'https://api.engage.so/v1'
let auth: string = ''
const notMeta = ['created_at', 'is_account', 'number', 'device_token', 'device_platform', 'email', 'first_name', 'last_name', 'tz', 'app_version', 'app_build', 'app_last_active']
const apiRoot = 'https://api.engage.so/'

async function _request (url: string, params: Record<string, any> | null, method: Methods) {
  try {
    const o: any = {
      method,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Basic ${auth}`
      },
      // throwHttpErrors: false,
      // prefixUrl: rootURL
    }
    if (params) {
      o.body = JSON.stringify(params)
    }
    // const response = await ky(url, o)
    const response = await fetch(`${apiRoot}${url}`, o)
    const body: any = await response.json()
    let error = 'API connection error'
    if (!response.ok) {
      if (body && body.error) {
        error = body.error
      }
      return { error }
    }
    return body
  } catch (e) {
    return { error: 'API connection error' }
  }
}
// Alias of _request method
// Same with _request for now but can later have modifications
export function request (url: string, params: Record<string, any> | null, method: Methods): object {
  return _request(url, params, method)
}

export function init (key: Key | string) {
  if (!key) {
    throw new EngageError('You need to pass in your API key(s).')
  }
  const options: Key = {
    key: undefined,
    secret: ''
  }
  if (typeof key === 'string') {
    options.key = key
  } else {
    if (!key.key) {
      throw new EngageError('`key` missing in object.')
    }
    if (key.key) {
      options.key = `${key.key}`
    }
    if (key.secret) {
      options.secret = `${key.secret}`
    }
  }
  // Set auth
  // auth = Buffer.from(`${options.key}:${options.secret}`).toString('base64')
  auth = btoa(`${options.key}:${options.secret}`)
}

// Data tracking
export async function identify (user: UserIdentifyParams) {
  if (!user) {
    throw new EngageError('You need to pass an object with at least an id.')
  }
  if (!user.id) {
    throw new EngageError('ID missing.')
  }
  if (user.email && (typeof user.email !== 'string' || !/^\S+@\S+$/.test(user.email))) {
    throw new EngageError('Email invalid.')
  }
  const params: DataParameters = {}
  params.meta = {}
  for (const k in user) {
    if (k === 'id' || notMeta.includes(k)) {
      params[k] = user[k]
    } else {
      params.meta[k] = user[k]
    }
  }

  return _request(`users/${user.id}`, params, 'PUT')
}
export async function addAttribute (uid: string, attributes: UserAttrParams) {
  if (!uid) {
    throw new EngageError('User ID missing.')
  }
  if (!attributes) {
    throw new EngageError('Attributes missing.')
  }
  if (!Object.keys(attributes).length) {
    throw new EngageError('Attributes missing.')
  }
  const params: DataParameters = {}
  params.meta = {}
  for (const k in attributes) {
    if (notMeta.includes(k)) {
      params[k] = attributes[k]
    } else {
      params.meta[k] = attributes[k]
      Object.assign(params.meta, k, attributes[k])
    }
  }
  if (Object.keys(params.meta).length) {
    delete params.meta
  }

  return _request(`users/${uid}`, params, 'PUT')
}
export async function track (uid: string, data: EventParameter) {
  if (!uid) {
    throw new EngageError('User ID missing.')
  }
  if (!data) {
    throw new EngageError('Event data missing.')
  }
  if (typeof data === 'string') {
    data = {
      event: data,
      value: true
    }
  } else {
    if (!Object.keys(data).length) {
      throw new EngageError('Attributes missing.')
    }
  }

  return _request(`users/${uid}/events`, data, 'POST')
}

export async function merge (sourceUid: string, destinationUid: string) {
  if (!sourceUid) {
    throw new EngageError('Source ID missing.')
  }
  if (!destinationUid) {
    throw new EngageError('Destination ID missing.')
  }

  return _request(`users/merge`, {
    source: sourceUid,
    destination: destinationUid
  }, 'POST')
}

// Account functions
export async function addToAccount(uid: string, accountId: string, role: string) {
  if (!uid) {
    throw new EngageError('User ID missing.')
  }
  if (!accountId) {
    throw new EngageError('Account ID missing.')
  }
  if (role && typeof role !== 'string') {
    throw new EngageError('Role should be a text.')
  }
  const g: Record<string, string> = {
    id: accountId
  }
  if (role) {
    g.role = role
  }
  return _request(`users/${uid}/accounts`, { accounts: [g] }, 'POST')
}
export async function removeFromAccount (uid: string, accountId: string){
  if (!uid) {
    throw new EngageError('User ID missing.')
  }
  if (!accountId) {
    throw new EngageError('Account ID missing.')
  }
  return _request(`users/${uid}/accounts/${accountId}`, null, 'DELETE')
}
export async function changeAccountRole (uid: string, accountId: string, role: string) {
  if (!uid) {
    throw new EngageError('User ID missing.')
  }
  if (!accountId) {
    throw new EngageError('Account ID missing.')
  }
  if (!role) {
    throw new EngageError('New role missing.')
  }
  return _request(`users/${uid}/accounts/${accountId}`, { role }, 'PUT')
}
export async function convertToCustomer (uid: string) {
  if (!uid) {
    throw new EngageError('User ID missing.')
  }
  return _request(`users/${uid}/convert`, { type: 'customer' }, 'POST')
}
export async function convertToAccount (uid: string) {
  if (!uid) {
    throw new EngageError('User ID missing.')
  }
  return _request(`users/${uid}/convert`, { type: 'account' }, 'POST')
}
