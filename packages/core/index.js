const fetch = require('cross-fetch')
const EngageError = require('./error')
const root = 'https://api.engage.so'
if (typeof btoa === 'undefined') {
  global.btoa = function (str) {
    return Buffer.from(str).toString('base64')
  }
}

const options = {
  key: null,
  secret: ''
}

async function request (url, params, method) {
  try {
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

const init = (o) => {
  if (!o) {
    throw new EngageError('You need to pass in your API key')
  }
  if (typeof o === 'string') {
    options.key = o
    return
  }

  if (!o.key) {
    throw new EngageError('`key` missing in object')
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
  Object.keys(o).map(k => {
    if (allowed.indexOf(k) !== -1) {
      params[k] = o[k]
    } else {
      params.meta[k] = o[k]
    }
  })

  return request(`${root}/users/${o.id}`, params, 'PUT')
}

const addAttribute = async (uid, data) => {
  if (!uid) {
    throw new EngageError('User id missing')
  }
  if (!data) {
    throw new EngageError('Attributes missing')
  }
  if (!Object.keys(data).length) {
    throw new EngageError('Attributes missing')
  }
  const notMeta = ['created_at', 'number', 'device_token', 'device_platform', 'email', 'first_name', 'last_name']
  const params = { meta: {} }
  Object.keys(data).map(k => {
    if (notMeta.indexOf(k) === -1) {
      params.meta[k] = data[k]
    } else {
      params[k] = data[k]
    }
  })

  return request(`${root}/users/${uid}`, params, 'PUT')
}

const track = async (uid, data) => {
  if (!uid) {
    throw new EngageError('User id missing')
  }
  if (!data) {
    throw new EngageError('Attributes missing')
  }
  if (typeof data === 'string') {
    data = {
      event: data,
      value: true
    }
  } else {
    if (!Object.keys(data).length) {
      throw new EngageError('Attributes missing')
    }
  }

  return request(`${root}/users/${uid}/events`, data, 'POST')
}

module.exports = {
  init,
  identify,
  addAttribute,
  track
}
