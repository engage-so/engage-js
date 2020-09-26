const path = require('path')
const fs = require('fs')
const jsdom = require('jsdom')
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
      const dom = new JSDOM('<!DOCTYPE html><head></head><body><div>engage</div></body>', {
        runScripts: 'dangerously',
        resources: 'usable',
        virtualConsole
      })
      const scriptEl = dom.window.document.createElement('script')
      scriptEl.textContent = fs.readFileSync(path.join(__dirname, '../dist/engage.js'), 'utf8')
      dom.window.document.head.appendChild(scriptEl)
      dom.window.document.addEventListener('DOMContentLoaded', () => {
        // console.log(dom.window)
        resolve(dom.window.Engage)
      })
    })
    expect(o).toMatchObject({
      init: expect.anything(),
      identify: expect.anything(),
      addAttribute: expect.anything(),
      track: expect.anything()
    })
  })
})
