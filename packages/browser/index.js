const Engage = require('@engage_so/core')

let uid
let channel
let framePort
let engageIframe

function loadScript (url, callback) {
  var script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = url

  script.onreadystatechange = callback
  script.onload = callback

  document.getElementsByTagName('head').item(0).appendChild(script)
}

function loadMessageFrame (onLoad) {
  if (document.getElementById('engage_wp_frame')) {
    return
  }
  channel = new MessageChannel()
  framePort = channel.port1
  framePort.onmessage = onMessage

  const w = window.innerWidth < 520 ? '100%' : '520px'

  engageIframe = document.createElement('iframe')
  engageIframe.src = 'https://d2969mkc0xw38n.cloudfront.net/widget/widget.html'
  engageIframe.id = 'engage_wp_frame'
  engageIframe.style = 'border:0;width:' + w + ';position:absolute;height:330px;bottom:0;right:0;'
  document.body.appendChild(engageIframe)
  // Let it load
  engageIframe.addEventListener('load', onLoad)
}

function updateContent (data) {
  if (engageIframe.style.display === 'none') {
    engageIframe.style.display = 'block'
  }
  framePort.postMessage(data)
}

async function checkNew () {
  // Is there new content?
  try {
    const pending = await Engage.request('/v1/messages/push/latest?uid=' + uid)
    if (pending && pending.msg_id) {
      if (!engageIframe) {
        loadMessageFrame(() => {
          engageIframe.contentWindow.postMessage('init', '*', [channel.port2])
          updateContent(pending)
        })
      } else {
        updateContent(pending)
      }
    }
  } catch (e) {
    console.log(e)
  }
}

function onMessage (e) {
  const data = e.data
  if (data.action === 'resize' && engageIframe.style.display !== 'none') {
    engageIframe.style.height = data.height + 'px'
    return
  }
  if (data.action === 'close') {
    // Mark as read on close #todo
    // Hide frame
    engageIframe.style.display = 'none'
    engageIframe.style.height = '330px'
  }
}

// Run pending queues
const queue = window.engage && window.engage.queue ? window.engage.queue.slice(0) : []
// const queue = []
for (const q of queue) {
  if (q[0] === 'identify' && q[1] && q[1].id) {
    uid = q[1].id
  }
  Engage[q[0]].apply(Engage, q.splice(1))
}

if (uid) {
  // Add iframe
  // Include Socket client
  loadScript('https://cdn.socket.io/4.1.1/socket.io.min.js', () => {
    const socket = io('https://ws.engage.so/webpush')
    socket.on('connect', () => {
      socket.emit('room', uid)
    })
    socket.on('webpush/notification', (data) => {
      if (!engageIframe) {
        loadMessageFrame(() => {
          engageIframe.contentWindow.postMessage('init', '*', [channel.port2])
          updateContent(data)
        })
      } else {
        updateContent(data)
      }
    })
  })

  // Does user have pending messages?
  checkNew()
}

module.exports = Engage
