const Engage = require('@engage_so/core')

function uuidv4 () {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

let key
let uid
let channel
let framePort
let h
const widgetIframe = document.createElement('iframe')
const containerDiv = document.createElement('div')
let docTitle = document.title
let badge = 0

function resize () {
  const w = window.innerWidth < 360 ? '100%' : '360px'
  h = window.innerHeight < 550 ? (window.innerHeight - 20) + 'px' : '550px'
  widgetIframe.style.cssText = 'width:' + w + ';height:' + h

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
.engage-widget-container .welcome {
animation: show 600ms 100ms cubic-bezier(0.38, 0.97, 0.56, 0.76) forwards;
opacity: 0;
position: fixed;
bottom: 90px;
font: 14px/1.5 Helvetica,Arial,sans-serif;;
color: #222;
border-radius: 8px;
right: 20px;
box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
cursor: pointer;
max-width: 300px;
padding: 1.2rem;
background-color: #fff
}
.engage-widget-container .welcome a svg {
color:#444
}
.engage-widget-container .welcome a:hover svg {
color:#111
}
@keyframes show {
  100% {
    opacity: 1;
    transform: none;
  }
}
.engage-widget-container .badge {
position: absolute;
top: 0;
min-width: 24px;
right: 0;
background-color: rgba(236, 56, 65, 0.9);
padding: 5px;
color: #fff;
border-radius: 50%;
}
.engage-widget-container .badge.dn {
display: none
}
.engage-widget-container .chat-btn svg {
width: 28px;
height: 28px;
display: inline;
}
.engage-widget-container .chat-btn:hover {
background-color: #0d74ede6;
}
.engage-banner p {
margin: 0;
padding: 0;
display: inline;
}
.engage-banner a {
color: inherit;
text-decoration: underline;
}
.engage-banner a:hover {
opacity: 0.7
}
.engage-banner a:hover svg {
stroke: #fff
}
.engage-ww.component-text p {
margin: 0;
padding: 6px 0
}
.engage-widget-webia iframe {
border: 0;
width: 100%;
}
.engage-widget-webia a {
color: #aaa
}
.engage-widget-webia a:hover {
color: #444
}
.engage-widget-webia {
padding: 1em 0;
background-color:#fff;
position: fixed;
width: 360px;
overflow-y: scroll;
max-height: 550px;
bottom: 10px;
right: 10px;
z-index: 10000;
border-radius: 5px;
box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.3);
}
.engage-widget-container iframe {
border: 0;
background-color:#fff;
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
`;
  const styleSheet = document.createElement("style")
  styleSheet.type = 'text/css'
  document.getElementsByTagName("head")[0].appendChild(styleSheet)
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
  widgetIframe.style.cssText = 'width:' + w + ';height:' + h
  containerDiv.appendChild(widgetIframe)
  const iconDiv = document.createElement('div')
  const button = document.createElement('button')
  button.className = 'chat-btn'
  button.innerHTML = '<span class="badge dn"></span><svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" fill="#ffffff" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M216,48H40A16,16,0,0,0,24,64V222.8a15.7,15.7,0,0,0,9.3,14.5,16,16,0,0,0,17-2.2L82,208.4l134-.4a16,16,0,0,0,16-16V64A16,16,0,0,0,216,48ZM160,152H96a8,8,0,0,1,0-16h64a8,8,0,0,1,0,16Zm0-32H96a8,8,0,0,1,0-16h64a8,8,0,0,1,0,16Z"></path></svg>'
  button.addEventListener('click', () => {
    toggleWidget()
  })
  iconDiv.appendChild(button)
  containerDiv.appendChild(iconDiv)
  document.body.appendChild(containerDiv)
  widgetIframe.addEventListener('load', onLoad)
}

function updateButtonBadge() {
  const el = containerDiv.querySelector('.badge')
  if (!el) {
    return
  }
  el.innerHTML = badge;
  if (badge === 0 && !el.classList.contains('dn')) {
    el.classList.add('dn')
    return
  }
  if (badge && el.classList.contains('dn')) {
    el.classList.remove('dn')
    return
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

const sound = new Audio('https://d2969mkc0xw38n.cloudfront.net/cdn/misc/pop.mp3')
let account
let wasDisconnected = false
let socket
let orgSocket
const cid = uuidv4()

function onMessage (e) {
  const data = e.data
  if (data.action === 'close') {
    // Hide frame
    containerDiv.classList.toggle('opened')
  }
  if (data.action === 'maximize') {
    const w = window.innerWidth < 520 ? '100%' : '520px'
    h = window.innerHeight < 650 ? (window.innerHeight - 20) + 'px' : '650px'
    widgetIframe.style.cssText = 'width:' + w + ';height:' + h

    framePort.postMessage({ ppties: {
      h
    }, type: 'set' })
  }
  if (data.action === 'minimize') {
    resize()
  }
  if (data.action === 'set_user') {
    user.name = data.user.name
    user.email = data.user.email
    window.localStorage.setItem('engage_user', JSON.stringify({
      uid,
      name: data.user.name,
      email: data.user.email
    }))
  }
  if (data.action === 'send_chat') {
    const params = {
      body: data.body,
      uid: user.uid,
      cid
    };
    if (user.name) {
      params.name = user.name
    }
    if (user.email) {
      params.email = user.email.trim().toLowerCase()
    }
    Engage.request('/messages/chat', params, 'POST')
      .then(body => {
        // Set uid
        if (!body.uid) {
          return
        }
        uidSet = true
        if (body.uid === user.uid) {
          return
        }
        // If user sent anon id but exist on server w/ diff id
        const uid = body.uid
        // Join new room
        socket.emit('room', account.id+':'+uid)
        user.uid = uid;
        framePort.postMessage({ user, type: 'set' })
        window.localStorage.setItem('engage_user', JSON.stringify(user))
      });
  }
  if (data.action === 'ack') {
    // Mark message as read
    Engage.request('/messages/chat/ack', { id: data.id }, 'POST')
      .then(() => {})
  }
  if (data.action === 'typing') {
    orgSocket.emit(data.action, {
      org: account.id,
      parent_id: data.parent_id,
      user: user.uid
    })
  }
  if (data.action === 'stopped-typing') {
    orgSocket.emit(data.action, {
      org: account.id,
      parent_id: data.parent_id,
      user: user.uid
    })
  }
}

function toggleWidget () {
  // Once window is visible, reset badge and title
  if (!containerDiv.classList.contains('opened')) {
    document.title = docTitle
    badge = 0
    updateButtonBadge()
    // Clear welcome
    const wd = document.querySelector('.engage-widget-container .welcome')
    if (wd) {
      wd.remove()
    }
  }
  containerDiv.classList.toggle('opened')
}

function joinRoom () {
  if (socket && account && account.id) {
    // console.log('Status', socket.connected)
    socket.emit('room', account.id)
    socket.emit('room', account.id+':'+uid)
  }
}

function createWebPushFrame (body, o) {
  body = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet"><style>* {box-sizing:border-box;padding:0;margin:0;}body{font-family:'Inter',sans-serif;padding:0 1em}h1,h2,h3,p{margin:0;padding:6px 0;color:inherit;}</style>
${body}
<img src="https://us-central1-suet-170506.cloudfunctions.net/ppx?s=o&d=${o.domain_id}&m=${o.msg_id}">`
  const div = document.createElement('div')
  div.className = 'engage-widget-webia'
  h = window.innerHeight < 550 ? (window.innerHeight - 50) + 'px' : '550px'
  div.style.cssText = 'max-height:' + h
  // Close
  const closeDiv = document.createElement('div')
  closeDiv.style.cssText = 'padding:0 1em 0.5em 0;text-align:right'
  const close = document.createElement('a')
  close.setAttribute('href', '#')
  close.innerHTML = `<svg width="24" height="24" style="width:24px;height:24px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></a>`
  close.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.engage-widget-webia').remove()
  });
  closeDiv.appendChild(close)
  div.appendChild(closeDiv)
  // iframe
  const iframe = document.createElement('iframe')
  div.appendChild(iframe)
  div.appendChild(iframe)
  document.body.appendChild(div)
  iframe.contentWindow.document.open()
  iframe.contentWindow.document.write(body)
  iframe.contentWindow.document.close()
  iframe.onload = function() {
    iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px'
  }
}

loadScript('https://cdn.socket.io/4.5.4/socket.io.min.js', () => {
  socket = io('https://ws.engage.so/webpush')
  orgSocket = io('https://ws.engage.so/inbound')
  socket.on('connect', async () => {
    if (uid) {
      joinRoom()
      // Load pending messages here
      if (wasDisconnected) {
        // Load new messages here
        try {
          const chat = await Engage.request('/messages/chat/open?uid=' + uid + '&since=' + lastMsgId)
          if (chat && chat.messages && chat.messages.length) {
            lastMsgId = chat.messages[chat.messages.length - 1].id
            const opened = containerDiv.classList.contains('opened')
            // Hidden or not?
            if (document.visibilityState === 'hidden' || !opened) {
              try {
                sound.play()
              } catch (e) {}
              if (!opened) {
                document.title = '* New message'
                badge += chat.messages.length
                updateButtonBadge()
              }
            }
            for (const m of chat.messages) {
              framePort.postMessage({ data: m, type: 'new_message' })
            }
          }
        } catch (e) {
          console.warn(e)
        }
        wasDisconnected = false
      }
    }
  });
  socket.on('disconnect', () => {
    wasDisconnected = true
    // Attempt reconnecting
    let delay = 2000
    setTimeout(function tick() {
      if (!wasDisconnected) {
        return
      }
      socket.connect()
      delay *= 1.5
      setTimeout(tick, delay)
    }, delay)
  });
  // Notify of online agents
  socket.on('agents_online', (count) => {
    setTimeout(function checkfp() {
      if (framePort) {
        framePort.postMessage({ agents_online: count, type: 'set' })
      } else {
        setTimeout(checkfp, 1000)
      }
    }, 0)
  });
  socket.on('webpush/notification', (data) => {
    if (!data.type) {
      return
    }
    const opened = containerDiv.classList.contains('opened')
    if (data.type === 'chat') {
      /*
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
      if (data.upgrade_uid && !uidSet) {
        // Temp socket data.
        if (data.uid !== uid) {
          uidSet = true
          uid = data.uid
          // Upgrade
          // Join new room
          socket.emit('room', account.id+':'+uid)
          user.uid = uid
          if (data.from && data.from.email) {
            user.email = data.from.email
          }
          framePort.postMessage({ user, type: 'set' })
          window.localStorage.setItem('engage_user', JSON.stringify(user))
        }
      }
      // Sent from same client
      if (data.cid === cid) {
        return
      }
      // Only update chat if uid is still same
      if (data.uid === uid) {
        // Notification if message not sent from you
        if (!data.outbound && (document.visibilityState === 'hidden' || !opened)) {
          try {
            sound.play()
          } catch (e) {}
          if (!opened) {
            document.title = '* New message'
            badge++
            updateButtonBadge()
          }
        }
        // Send message to iframe and set view to chat already
        framePort.postMessage({ data, type: 'new_message' })
        lastMsgId = data.id
      }
    }
    if (['typing', 'stopped-typing'].includes(data.type)) {
      framePort.postMessage({ type: data.type });
    }
    // Web inapp notifications
    if (data.type === 'web' && !opened) {
      // Only show if not opened
      createWebPushFrame(data.body, data)
    }
  });
});

// Customer identified?
const identified = !!uid
let uidSet = identified
let lastMsgId
let user = {}
if (uid) {
  user.uid = uid
}
// 2. Load message frame first
loadMessageFrame(async () => {
  try {
    account = await Engage.request('/account')
    // Turn on chat icon
    if (account.features && account.features.chat) {
      containerDiv.classList.remove('no-chat')
      if (account.features.chat.color) {
        // Update stylesheet
        const style = `.engage-widget-container .chat-btn {
          background-color: ${account.features.chat.color}
        }
        .engage-widget-container .chat-btn:hover {
        background-color: ${account.features.chat.color}e6;
        }`
        const styleSheet = document.createElement("style")
        styleSheet.type = 'text/css'
        document.getElementsByTagName("head")[0].appendChild(styleSheet)
        if (styleSheet.styleSheet) {
          // IE
          styleSheet.styleSheet.cssText = style
        } else {
          // Other browsers
          styleSheet.innerHTML = style
        }
      }
      if (account.features.chat.welcome) {
        const wDiv = document.createElement('div')
        wDiv.addEventListener('click', () => {
          toggleWidget()
        })
        wDiv.innerText = account.features.chat.welcome

        const closeDiv = document.createElement('div')
        closeDiv.style.cssText = 'position:absolute;right:5px;top:5px'
        const close = document.createElement('a')
        close.setAttribute('href', '#')
        close.innerHTML = `<svg width="18" height="18" style="width:18px;height:18px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></a>`
        close.addEventListener('click', (e) => {
          e.preventDefault()
          document.querySelector('.engage-widget-container .welcome').remove()
        })
        closeDiv.appendChild(close)

        const msgDiv = document.createElement('div')
        msgDiv.className = 'welcome'
        msgDiv.appendChild(closeDiv)
        msgDiv.appendChild(wDiv)
        containerDiv.appendChild(msgDiv)
      }
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
  joinRoom()
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

  // 1. Is there any new chat message?
  try {
    const chat = await Engage.request('/messages/chat/open?uid=' + uid)
    if (chat && chat.messages && chat.messages.length) {
      framePort.postMessage({ chat, type: 'chat' })
      lastMsgId = chat.messages[chat.messages.length - 1].id
      // How many unread messages?
      for (const m of chat.messages) {
        if (!m.outbound && !m.read) {
          badge++
        }
      }
      if (badge) {
        // Badge
        updateButtonBadge()
      }
    }
  } catch (e) {
    console.warn(e)
  }
  // 2. Is there a new web push
  try {
    const msg = await Engage.request('/messages/push/latest?uid=' + uid)
    if (msg && msg.body) {
      const opened = containerDiv.classList.contains('opened')
      if (!opened) {
        createWebPushFrame(msg.body, msg)
      }
    }
  } catch (e) {
    console.warn(e)
  }
  // 3. Is there a banner
  try {
    const data = await Engage.request('/campaigns/banners/active?uid=' + uid + '&path=' + window.location.protocol + '//' + window.location.href)
    const banner = document.createElement('div')
    banner.className = 'engage-banner'
    if (data) {
      if (data.style === 'inline') {
        let style = 'position:fixed;padding:1em;width:100%;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-sizing: border-box;'
        style += data.position === 'top' ? 'top:0' : 'bottom:0'
        style += ';background-color:'
        style += data.bgcolor ? data.bgcolor : '#10273c'
        style += ';color:'
        style += data.color ? data.color : '#fff'

        banner.style.cssText = style;
        const cs = window.getComputedStyle(document.body)
        const bkPosition = cs.getPropertyValue('position')
        const bkMarginTop = cs.getPropertyValue('margin-top')
        if (bkMarginTop) {
          document.body.style.marginTop = (+(bkPosition.replace(/[^0-9]/g, '')) + 53) + 'px'
        }
        document.body.style.position = 'relative'
        if (data.dismiss) {
          const link = document.createElement('a')
          link.href = '#'
          link.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="stroke:currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
          link.addEventListener('click', async (e) => {
            e.preventDefault()
            link.closest('.engage-banner').remove()
            document.body.style.marginTop = bkMarginTop
            document.body.style.position = bkPosition
            // Track dismiss
            await Engage.request('/campaigns/banners/' + data.id + '/track?uid=' + uid)
          });
          const fr = document.createElement('div')
          fr.style.cssText = 'float:right'
          fr.appendChild(link)
          banner.appendChild(fr)
        }
        const el = document.createElement('span')
        el.innerHTML = data.body
        banner.appendChild(el)
      } else if (data.style === 'float') {
        let style = 'z-index:99999;position:fixed;border-radius:.5rem;padding:1em;max-width:50%;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
        if (data.position === 'tr') {
          style += 'top: 10px; right: 10px'
        } else if (data.position === 'tl') {
          style += 'top: 10px; left: 10px'
        } else if (data.position === 'bl') {
          style += 'bottom: 10px; left: 10px'
        } else if (data.position === 'br') {
          style += 'bottom: 10px; right: 10px'
        }
        style += ';background-color:'
        style += data.bgcolor ? data.bgcolor : '#10273c'
        style += ';color:'
        style += data.color ? data.color : '#fff'

        banner.style.cssText = style
        banner.innerHTML = data.body
        if (data.dismiss) {
          const link = document.createElement('a')
          link.href = '#'
          link.style.cssText = 'margin-left:10px'
          link.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="stroke:currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
          link.addEventListener('click', async (e) => {
            e.preventDefault()
            link.closest('.engage-banner').remove()
            // track dismiss
            await Engage.request('/campaigns/banners/' + data.id + '/track?uid=' + uid)
          });
          banner.appendChild(link)
        }
      }
      // Todo: track display (unique)
      document.body.insertBefore(banner, document.body.firstChild)
    }
  } catch (e) {
    console.warn(e)
  }

  // todo: What about conversations?
  // Get any data-help-id
  const helpLinks = document.querySelectorAll('[data-help-id]')
  for (const el of helpLinks) {
    el.addEventListener('click', function(e) {
      e.preventDefault()
      const help = {
        id: this.dataset.helpId
      };
      if (this.dataset.helpType) {
        help.type = this.dataset.helpType
      }
      if (this.dataset.helpLocale) {
        help.locale = this.dataset.helpLocale
      }
      framePort.postMessage({ help, type: 'action' })
      if (!containerDiv.classList.contains('opened')) {
        containerDiv.classList.add('opened')
      }
    });
  }

  // On resize
  window.addEventListener('resize', () => {
    resize()
  });
});

// Button click
Engage.openChat = function () {
  toggleWidget()
};
Engage.openHelp = function (id, helpType, locale) {
  const help = {
    id
  };
  if (helpType) {
    help.type = helpType
  }
  if (locale) {
    help.locale = locale
  }
  framePort.postMessage({ help, type: 'action' })
  if (!containerDiv.classList.contains('opened')) {
    containerDiv.classList.add('opened')
  }
};

module.exports = Engage
