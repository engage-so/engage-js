const path = require('path')
const fs = require('fs')
const jsdom = require('jsdom')
const { MessageChannel } = require('node:worker_threads')
const { JSDOM } = jsdom
const virtualConsole = new jsdom.VirtualConsole()
let error
virtualConsole.on('error', e => {
  error = e
})
virtualConsole.on('jsdomError', e => {
  error = e
})

describe('Bundle for browser', () => {
  test('should not throw any browser console error', () => {
    expect(error).toBeUndefined()
  })
  test('window should have Engage object', async () => {
    const o = await new Promise((resolve) => {
      const { window } = new JSDOM('', {
        runScripts: 'dangerously',
        virtualConsole
      })
      const document = window.document
      window.MessageChannel = MessageChannel
      const scriptContent = fs.readFileSync(path.join(__dirname, '../dist/engage.js'), { encoding: 'utf-8' })
      window.eval(scriptContent)
      resolve(window.Engage)
    })
    expect(o).toMatchObject({
      init: expect.anything(),
      identify: expect.anything(),
      addAttribute: expect.anything(),
      track: expect.anything()
    })
  })
})
