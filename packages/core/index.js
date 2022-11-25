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
    if (!params) {
      params = {}
    }
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Basic ${btoa(`${options.key}:${options.secret}`)}`
      },
      body: JSON.stringify(params)
    })
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
    throw new EngageError('You need to pass an object with at least an id and email.')
  }
  if (!o.id) {
    throw new EngageError('ID missing.')
  }
  if (o.email && !/^\S+@\S+$/.test(o.email)) {
    throw new EngageError('Email invalid.')
  }
  const allowed = ['id', 'email', 'number', 'created_at', 'device_token', 'device_platform', 'first_name', 'last_name']
  const params = {
    meta: {}
  }
  for (const k in o) {
    if (allowed.indexOf(k) !== -1) {
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
  const notMeta = ['created_at', 'number', 'device_token', 'device_platform', 'email', 'first_name', 'last_name']
  const params = { meta: {} }
  for (const k in data) {
    if (notMeta.indexOf(k) === -1) {
      params.meta[k] = data[k]
    } else {
      params[k] = data[k]
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

const addToGroup = async (uid, gid, role) => {
  if (!uid) {
    throw new EngageError('User id missing.')
  }
  if (!gid) {
    throw new EngageError('Group id missing.')
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
  return _request(`${root}/users/${uid}/groups`, { groups: [g] }, 'POST')
}
const removeFromGroup = async (uid, gid) => {
  if (!uid) {
    throw new EngageError('User id missing.')
  }
  if (!gid) {
    throw new EngageError('Group id missing.')
  }
  return _request(`${root}/users/${uid}/groups/${gid}`, null, 'DELETE')
}

const changeGroupRole = async (uid, gid, role) => {
  if (!uid) {
    throw new EngageError('User id missing.')
  }
  if (!gid) {
    throw new EngageError('Group id missing.')
  }
  if (!role) {
    throw new EngageError('New role missing.')
  }
  return _request(`${root}/users/${uid}/groups/${gid}`, { role }, 'PUT')
}

const convertToUser = async (uid) => {
  if (!uid) {
    throw new EngageError('User id missing.')
  }
  return _request(`${root}/users/${uid}/convert`, { type: 'user' }, 'POST')
}
const convertToGroup = async (uid) => {
  if (!uid) {
    throw new EngageError('User id missing.')
  }
  return _request(`${root}/users/${uid}/convert`, { type: 'group' }, 'POST')
}

module.exports = {
  init,
  identify,
  addAttribute,
  track,
  request,
  addToGroup,
  removeFromGroup,
  changeGroupRole,
  convertToUser,
  convertToGroup
}
