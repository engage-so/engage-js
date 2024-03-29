import * as Engage from '../src/index'
const id = 'uzl38704@omeie.com'
const sid = 'a6236e83-f7c1-4003-8e1a-951f6e1d5c60'
const gid = '7d1a5e27-5a6b-4b38-a8bd-e59b8a1b2f41'

describe('Init', () => {
  test('should throw if no parameters sent', () => {
    expect(() => {
      Engage.init()
    }).toThrow('API')
  })
  test('should throw if parameter is empty object', () => {
    expect(() => {
      Engage.init({})
    }).toThrow('key')
  })
  test('should throw if empty key sent', () => {
    expect(() => {
      Engage.init('')
    }).toThrow()
  })
  test('should not throw if key/secret is sent', () => {
    expect(() => {
      Engage.init({
        key: process.env.KEY,
        secret: process.env.SECRET
      })
    }).not.toThrow()
  })
})

describe('Identify', () => {
  test('should throw if no parameter passed', async () => {
    await expect(Engage.identify()).rejects.toThrow('object')
  })
  test('should throw if empty string passed', async () => {
    await expect(Engage.identify('')).rejects.toThrow('id')
  })
  test('should throw if empty object passed', async () => {
    await expect(Engage.identify({})).rejects.toThrow(/id/i)
  })
  test('should not throw if no email passed', async () => {
    await expect(() => {
      Engage.identify({ id: gid })
    }).not.toThrow()
  })
  test('should throw if invalid email passed', async () => {
    await expect(Engage.identify({
      id,
      email: 'invalid'
    })).rejects.toThrow(/email/i)
  })
  test('should work if id and email passed', async () => {
    await expect(Engage.identify({
      id,
      email: 'fickledreams@yahoo.com'
    })).resolves.toMatchObject({
      uid: id,
      email: 'fickledreams@yahoo.com'
    })
  })
  test('should turn to account if has is_account', async () => {
    await expect(Engage.identify({
      id,
      is_account: true
    })).resolves.toMatchObject({
      is_account: true
    })
  })
  test('should turn to user if is_account is false', async () => {
    await expect(Engage.identify({
      id,
      is_account: false
    })).resolves.toMatchObject({
      is_account: false
    })
  })
})

describe('Add attribute', () => {
  test('should throw if no parameter passed', async () => {
    await expect(Engage.addAttribute()).rejects.toThrow('id')
  })
  test('should throw if no data attribute passed', async () => {
    await expect(Engage.addAttribute(id)).rejects.toThrow(/attributes/i)
  })
  test('should throw if empty object passed', async () => {
    await expect(Engage.addAttribute(id, {})).rejects.toThrow(/attributes/i)
  })
  test('should resolve if parameters passed', async () => {
    await expect(Engage.addAttribute(sid, {
      first_name: 'Opeyemi',
      active: true,
      created_at: '2020-08-11'
    })).resolves.toMatchObject({
      uid: sid,
      first_name: 'Opeyemi'
    })
  })
  test('should turn to account if has is_account', async () => {
    await expect(Engage.addAttribute(id, {
      is_account: true
    })).resolves.toMatchObject({
      is_account: true
    })
  })
  test('should turn to user if is_account is not added', async () => {
    await expect(Engage.addAttribute(id, {
      is_account: false
    })).resolves.toMatchObject({
      is_account: false
    })
  })
})

describe('Track', () => {
  test('should throw if no parameter passed', async () => {
    await expect(Engage.track()).rejects.toThrow('ID')
  })
  test('should throw if no data attribute passed', async () => {
    await expect(Engage.track(id)).rejects.toThrow(/data/i)
  })
  test('should throw if empty object passed', async () => {
    await expect(Engage.track(id, {})).rejects.toThrow(/attributes/i)
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

describe('Merge users', () => {
  test('should throw if no source id', async () => {
    await expect(Engage.merge()).rejects.toThrow(/id/i)
  })
  test('should throw if no destination id', async () => {
    await expect(Engage.merge(id)).rejects.toThrow(/id/i)
  })
  test('should merge if all is well', async () => {
    await expect(Engage.merge(sid, id)).resolves.toMatchObject({
      status: 'queued'
    })
  })
})

describe('Convert to account', () => {
  test('should convert to account', async () => {
    await expect(Engage.convertToAccount(gid)).resolves.toMatchObject({
      is_account: true
    })
  })
})

describe('Convert to customer', () => {
  test('should convert to customer', async () => {
    await expect(Engage.convertToCustomer(gid)).resolves.toMatchObject({
      is_account: false
    })
  })
})

describe('Add to account', () => {
  test('should throw if no account id added', async () => {
    await expect(Engage.addToAccount(id)).rejects.toThrow(/id/i)
  })
  test('should throw if role and role not string', async () => {
    await expect(Engage.addToAccount(id, gid, [ 'something' ])).rejects.toThrow(/Role/)
  })
  test('should pass if account id added', async () => {
    await expect(Engage.addToAccount(id, gid)).resolves.toMatchObject({
      accounts: [{
        id: gid
      }]
    })
  })
})

describe('Change account role', () => {
  test('should throw if no parameters', async () => {
    await expect(Engage.changeAccountRole()).rejects.toThrow(/missing/)
  })
  test('should throw if no account id', async () => {
    await expect(Engage.changeAccountRole(id)).rejects.toThrow(/missing/)
  })
  test('should throw if no role', async () => {
    await expect(Engage.changeAccountRole(id, gid)).rejects.toThrow(/missing/)
  })
  test('should pass if all parameters set', async () => {
    await expect(Engage.changeAccountRole(id, gid, 'owner')).resolves.toMatchObject({
      accounts: [{
        id: gid,
        role: 'owner'
      }]
    })
  })
})

describe('Remove from account', () => {
  test('should throw if no parameters', async () => {
    await expect(Engage.removeFromAccount()).rejects.toThrow(/missing/)
  })
  test('should throw if no account id', async () => {
    await expect(Engage.removeFromAccount(id)).rejects.toThrow(/missing/)
  })
  test('should pass if all parameters set', async () => {
    await expect(Engage.removeFromAccount(id, gid)).resolves.toMatchObject({
      accounts: []
    })
  })
})
