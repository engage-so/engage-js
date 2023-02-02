const Engage = require('@engage_so/core')

function uuidv4 () {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

let key
let uid
let channel
let framePort
let h
const widgetIframe = document.createElement('iframe')
const containerDiv = document.createElement('div')

function resize () {
  const w = window.innerWidth < 360 ? '100%' : '360px'
  h = window.innerHeight < 550 ? (window.innerHeight - 20) + 'px' : '550px'
  widgetIframe.style = 'width:' + w + ';height:' + h;

  framePort.postMessage({ ppties: {
    h
  }, type: 'set' })
}

function loadScript (url, callback) {
  const script = document.createElement('script')
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
  
  const styles = `
  .engage-widget-container iframe {
    display: none;
  }
  .engage-widget-container.no-chat > div {
    display: none;
  }
  .engage-widget-container.opened iframe {
    display: block;
  }
  .engage-widget-container.opened .chat-btn {
    display: none;
  }
  .engage-widget-container .chat-btn {
    position: fixed;
    bottom: 20px;
    right: 20px;
    border: 0;
    cursor: pointer;
    width: 60px;
    height: 60px;
    border-radius: 100%;
    background-color: #0d74ed
  }
  .engage-widget-container .chat-btn svg {
    width: 28px;
    height: 28px;
  }
  .engage-widget-container .chat-btn:hover {
    background-color: #3d90f1;
  }
  .engage-widget-container iframe {
    border: 0;
    position: fixed;
    width: 360px;
    height: 550px;
    bottom: 10px;
    right: 10px;
    z-index: 10000;
    border-radius: 5px;
    box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.3);
    transition: width .5s, height .5s;
  }
  `
  const styleSheet = document.createElement("style")
  styleSheet.type = 'text/css'
  document.getElementsByTagName("head")[0].appendChild(styleSheet);
  if (styleSheet.styleSheet) {
    // IE
    styleSheet.styleSheet.cssText = styles
  } else {
    // Other browsers
    styleSheet.innerHTML = styles
  }

  containerDiv.className = 'engage-widget-container no-chat'
  widgetIframe.src = 'https://d2969mkc0xw38n.cloudfront.net/widget_v2/widget.html'
  widgetIframe.id = 'engage_wp_frame'
  const w = window.innerWidth < 360 ? '100%' : '360px'
  h = window.innerHeight < 550 ? (window.innerHeight - 20) + 'px' : '550px'
  widgetIframe.style = 'width:' + w + ';height:' + h
  containerDiv.appendChild(widgetIframe)
  const iconDiv = document.createElement('div')
  const button = document.createElement('button')
  button.className = 'chat-btn'
  button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" fill="#ffffff" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M216,48H40A16,16,0,0,0,24,64V222.8a15.7,15.7,0,0,0,9.3,14.5,16,16,0,0,0,17-2.2L82,208.4l134-.4a16,16,0,0,0,16-16V64A16,16,0,0,0,216,48ZM160,152H96a8,8,0,0,1,0-16h64a8,8,0,0,1,0,16Zm0-32H96a8,8,0,0,1,0-16h64a8,8,0,0,1,0,16Z"></path></svg>'
  button.addEventListener('click', () => {
    containerDiv.classList.toggle('opened')
  })
  iconDiv.appendChild(button)
  containerDiv.appendChild(iconDiv)
  document.body.appendChild(containerDiv)
  widgetIframe.addEventListener('load', onLoad)
}

function onMessage (e) {
  const data = e.data
  if (data.action === 'close') {
    // Hide frame
    containerDiv.classList.toggle('opened')
  }
  if (data.action === 'maximize') {
    const w = window.innerWidth < 520 ? '100%' : '520px'
    h = window.innerHeight < 650 ? (window.innerHeight - 20) + 'px' : '650px'
    widgetIframe.style = 'width:' + w + ';height:' + h;

    framePort.postMessage({ ppties: {
      h
    }, type: 'set' })
  }
  if (data.action === 'minimize') {
    resize()
  }
  if (data.action === 'set_user') {
    window.localStorage.setItem('engage_user', JSON.stringify({
      uid,
      name: data.user.name,
      email: data.user.email
    }))
  }
}

// Run pending queues
const queue = window.engage && window.engage.queue ? window.engage.queue.slice(0) : []
for (const q of queue) {
  if (q[0] === 'identify' && q[1] && q[1].id) {
    uid = q[1].id
  // } else if (!uid && q[0] === 'track' && q[1]) {
  //   uid = q[1]
  } else if (!key && q[0] === 'init' && q[1]) {
    key = q[1]
  }
  Engage[q[0]].apply(Engage, q.splice(1))
}

let account
let socketConnected = false
let joinedRm = false
let socket

function joinRoom () {
  if (account && account.id) {
    socket.emit('room', account.id)
    socket.emit('room', account.id+':'+uid)
  }
}

loadScript('https://cdn.socket.io/4.5.4/socket.io.min.js', () => {
  socket = io('https://ws.engage.so/webpush')
  socket.on('connect', async () => {
    socketConnected = true
    if (uid) {
      joinedRm = true
      await joinRoom()
    }
  })
  // Notify of online agents
  socket.on('agents_online', (count) => {
    setTimeout(function checkfp() {
      if (framePort) {
        framePort.postMessage({ agents_online: count, type: 'set' })
      } else {
        setTimeout(checkfp, 1000)
      }
    }, 0)
  })
  socket.on('webpush/notification', (data) => {
    /*
    - If window not in focus
      - Make sound
      - Change title
    - If closed
      - If chat
        - Make sound
        - Show notification and badge
      - If message
        - Popup simple overlay
    - If open
      - Chat/Message
        - If open, just update
        - If not, notification in title bar or somewhere
    */
    // Send message across
    const opened = containerDiv.classList.contains('opened')

    if (!engageIframe) {
      loadMessageFrame(() => {
        const m = { h: window.innerHeight }
        engageIframe.contentWindow.postMessage(m, '*', [channel.port2])
        updateContent(data)
      })
    } else {
      updateContent(data)
    }
  })
})

// Customer identified?
const identified = !!uid
let user = {}
// 2. Load message frame first
loadMessageFrame(async () => {
  try {
    account = await Engage.request('/account')
    // Turn on chat icon
    if (account.features && account.features.chat) {
      containerDiv.classList.remove('no-chat')
    }
  } catch (e) {
    return console.warn(e)
  }

  if (!uid) {
    // Is there an id in local storage?
    const u = window.localStorage.getItem('engage_user')
    if (u) {
      try {
        user = JSON.parse(u)
        if (user.uid) {
          uid = user.uid
        }
      } catch (e) {}
    }
  }
  if (!uid) {
    // Generate anonymous id
    uid = uuidv4()
    user.uid = uid
    // and store
    window.localStorage.setItem('engage_user', JSON.stringify({
      uid
    }))
  }
  if (!joinedRm && socketConnected) {
    joinedRm = true
    await joinRoom()
  }
  // Register port with widget
  widgetIframe.contentWindow.postMessage(':)', '*', [channel.port2])
  // Set height
  framePort.postMessage({ ppties: {
    h
  }, type: 'set' })
  // Send uid
  framePort.postMessage({ user, type: 'set' })
  framePort.postMessage({ identified, type: 'set' })
  // Send account
  if (account) {
    framePort.postMessage({ account, type: 'set' })
  }
  // Is there any new chat message?
  try {
    const chat = await Engage.request('/messages/chat?uid=' + uid)
    if (chat && chat.messages && chat.messages.length) {
      framePort.postMessage({ chat, type: 'chat' })
    }
  } catch (e) {
    console.warn(e);
  }

  // todo: What about conversations?
  // Get any data-help-id
  const helpLinks = document.querySelectorAll('[data-help-id]')
  for (const el of helpLinks) {
    el.addEventListener('click', function(e) {
      e.preventDefault()
      const help = {
        id: this.dataset.helpId
      }
      if (this.dataset.helpType) {
        help.type = this.dataset.helpType
      }
      if (this.dataset.helpLocale) {
        help.locale = this.dataset.helpLocale;
      }
      framePort.postMessage({ help, type: 'action' })
      if (!containerDiv.classList.contains('opened')) {
        containerDiv.classList.add('opened')
      }
    })
  }

  // On resize
  window.addEventListener('resize', () => {
    resize()
  })
})

module.exports = Engage
