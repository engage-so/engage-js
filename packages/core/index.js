const fetch = require('cross-fetch')
const Buffer = require('buffer/').Buffer
const EngageError = require('./error')
const root = 'https://api.engage.so/v1'
if (typeof btoa === 'undefined') {
  global.btoa = function (str) {
    return Buffer.from(str).toString('base64')
  }
}

const options = {
  key: null,
  secret: ''
}

async function _request (url, params, method) {
  try {
    const o = {
      method,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Basic ${btoa(`${options.key}:${options.secret}`)}`
      },
    }
    if (params) {
      o.body = JSON.stringify(params)
    }
    const response = await fetch(url, o)
    const body = await response.json()
    let error = 'API connection error'
    if (!response.ok) {
      if (body && body.error) {
        error = body.error
      }
      return { error }
    }
    return body
  } catch (e) {
    // console.log(e)
    return { error: 'API connection error' }
  }
}

// Alias of _request method
// Same with _request for now but can later have modifications
const request = (url, params, method) => {
  return _request(`${root}${url}`, params, method)
}

const init = (o) => {
  if (!o) {
    throw new EngageError('You need to pass in your API key.')
  }
  if (typeof o === 'string') {
    options.key = o
    return
  }

  if (!o.key) {
    throw new EngageError('`key` missing in object.')
  }
  if (o.key) {
    options.key = `${o.key}`
  }
  if (o.secret) {
    options.secret = `${o.secret}`
  }
}

const identify = async (o) => {
  if (!o) {
    throw new EngageError('You need to pass an object with at least an id.')
  }
  if (!o.id) {
    throw new EngageError('ID missing.')
  }
  if (o.email && !/^\S+@\S+$/.test(o.email)) {
    throw new EngageError('Email invalid.')
  }
  const allowed = ['id', 'is_account', 'email', 'number', 'created_at', 'device_token', 'device_platform', 'first_name', 'last_name', 'tz']
  const params = {
    meta: {}
  }
  for (const k in o) {
    if (allowed.includes(k)) {
      params[k] = o[k]
    } else {
      params.meta[k] = o[k]
    }
  }

  return _request(`${root}/users/${o.id}`, params, 'PUT')
}

const addAttribute = async (uid, data) => {
  if (!uid) {
    throw new EngageError('User id missing.')
  }
  if (!data) {
    throw new EngageError('Attributes missing.')
  }
  if (!Object.keys(data).length) {
    throw new EngageError('Attributes missing.')
  }
  const notMeta = ['created_at', 'is_account', 'number', 'device_token', 'device_platform', 'email', 'first_name', 'last_name', 'tz', 'app_version', 'app_build', 'app_last_active']
  const params = { meta: {} }
  for (const k in data) {
    if (notMeta.includes(k)) {
      params[k] = data[k]
    } else {
      params.meta[k] = data[k]
    }
  }

  return _request(`${root}/users/${uid}`, params, 'PUT')
}

const track = async (uid, data) => {
  if (!uid) {
    throw new EngageError('User id missing.')
  }
  if (!data) {
    throw new EngageError('Attributes missing.')
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

  return _request(`${root}/users/${uid}/events`, data, 'POST')
}

const merge = async (source, destination) => {
  if (!source) {
    throw new EngageError('Source ID missing.')
  }
  if (!destination) {
    throw new EngageError('Destination ID missing.')
  }

  return _request(`${root}/users/merge`, { source, destination }, 'POST')
}

const addToAccount = async (uid, gid, role) => {
  if (!uid) {
    throw new EngageError('User id missing.')
  }
  if (!gid) {
    throw new EngageError('Account id missing.')
  }
  if (role && typeof role !== 'string') {
    throw new EngageError('Role should be a text.')
  }
  const g = {
    id: gid
  }
  if (role) {
    g.role = role
  }
  return _request(`${root}/users/${uid}/accounts`, { accounts: [g] }, 'POST')
}
const removeFromAccount = async (uid, gid) => {
  if (!uid) {
    throw new EngageError('User id missing.')
  }
  if (!gid) {
    throw new EngageError('Account id missing.')
  }
  return _request(`${root}/users/${uid}/accounts/${gid}`, null, 'DELETE')
}

const changeAccountRole = async (uid, gid, role) => {
  if (!uid) {
    throw new EngageError('User id missing.')
  }
  if (!gid) {
    throw new EngageError('Account id missing.')
  }
  if (!role) {
    throw new EngageError('New role missing.')
  }
  return _request(`${root}/users/${uid}/accounts/${gid}`, { role }, 'PUT')
}

const convertToCustomer = async (uid) => {
  if (!uid) {
    throw new EngageError('User id missing.')
  }
  return _request(`${root}/users/${uid}/convert`, { type: 'customer' }, 'POST')
}
const convertToAccount = async (uid) => {
  if (!uid) {
    throw new EngageError('User id missing.')
  }
  return _request(`${root}/users/${uid}/convert`, { type: 'account' }, 'POST')
}

module.exports = {
  init,
  identify,
  addAttribute,
  track,
  merge,
  request,
  addToAccount,
  removeFromAccount,
  changeAccountRole,
  convertToCustomer,
  convertToAccount
}
