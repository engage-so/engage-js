const Engage = require('../index')
const id = '1234'

describe('Init', () => {
  test('should throw if no parameters sent', () => {
    expect(() => {
      Engage.init()
    }).toThrowError('API')
  })
  test('should throw if parameter is empty object', () => {
    expect(() => {
      Engage.init({})
    }).toThrowError('key')
  })
  test('should throw if empty key sent', () => {
    expect(() => {
      Engage.init('')
    }).toThrowError()
  })
  test('should not throw if key/secret is sent', () => {
    expect(() => {
      Engage.init({
        key: process.env.KEY,
        secret: process.env.SECRET
      })
    }).not.toThrowError()
  })
})

describe('Identify', () => {
  test('should throw if no parameter passed', async () => {
    await expect(Engage.identify()).rejects.toThrowError('object')
  })
  test('should throw if empty string passed', async () => {
    await expect(Engage.identify('')).rejects.toThrowError('id')
  })
  test('should throw if empty object passed', async () => {
    await expect(Engage.identify({})).rejects.toThrowError(/id/i)
  })
  test('should throw if no email passed', async () => {
    await expect(Engage.identify({ id })).rejects.toThrowError(/email/i)
  })
  test('should throw if invalid email passed', async () => {
    await expect(Engage.identify({
      id,
      email: 'invalid'
    })).rejects.toThrowError(/email/i)
  })
  test('should work if id and email passed', async () => {
    await expect(Engage.identify({
      id,
      email: 'fickledreams@yahoo.com'
    })).resolves.toMatchObject({
      status: 'ok'
    })
  })
})

describe('Add attribute', () => {
  test('should throw if no parameter passed', async () => {
    await expect(Engage.addAttribute()).rejects.toThrowError('id')
  })
  test('should throw if no data attribute passed', async () => {
    await expect(Engage.addAttribute(id)).rejects.toThrowError(/attributes/i)
  })
  test('should throw if empty object passed', async () => {
    await expect(Engage.addAttribute(id, {})).rejects.toThrowError(/attributes/i)
  })
  test('should resolve if parameters passed', async () => {
    await expect(Engage.addAttribute(id, {
      first_name: 'Opeyemi',
      active: true,
      created_at: '2020-08-11'
    })).resolves.toMatchObject({
      status: 'ok'
    })
  })
})

describe('Track', () => {
  test('should throw if no parameter passed', async () => {
    await expect(Engage.track()).rejects.toThrowError('id')
  })
  test('should throw if no data attribute passed', async () => {
    await expect(Engage.track(id)).rejects.toThrowError(/attributes/i)
  })
  test('should throw if empty object passed', async () => {
    await expect(Engage.track(id, {})).rejects.toThrowError(/attributes/i)
  })
  test('should pass if string property passed', async () => {
    await expect(Engage.track(id, 'loggedin')).resolves.toMatchObject({
      status: 'ok'
    })
  })
  test('should pass if right parameters passed', async () => {
    await expect(Engage.track(id, {
      event: 'played',
      value: 'vid_133',
      timestamp: '2020-05-30T09:30:10Z'
    })).resolves.toMatchObject({
      status: 'ok'
    })
  })
  test('should resolve if other variant passed', async () => {
    await expect(Engage.track(id, {
      event: 'loggedin',
      properties: {
        ip: '127.0.0.1',
        referral: 'localhost'
      }
    })).resolves.toMatchObject({
      status: 'ok'
    })
  })
})
