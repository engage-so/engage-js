/**
 * Version: 1.3.2; 2021-06-21
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Engage = factory());
}(this, (function () { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, basedir, module) {
		return module = {
			path: basedir,
			exports: {},
			require: function (path, base) {
				return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
			}
		}, fn(module, module.exports), module.exports;
	}

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
	}

	var browserPonyfill = createCommonjsModule(function (module, exports) {
	var __self__ = (function (root) {
	function F() {
	this.fetch = false;
	this.DOMException = root.DOMException;
	}
	F.prototype = root;
	return new F();
	})(typeof self !== 'undefined' ? self : commonjsGlobal);
	(function(self) {

	var irrelevant = (function (exports) {

	  var support = {
	    searchParams: 'URLSearchParams' in self,
	    iterable: 'Symbol' in self && 'iterator' in Symbol,
	    blob:
	      'FileReader' in self &&
	      'Blob' in self &&
	      (function() {
	        try {
	          new Blob();
	          return true
	        } catch (e) {
	          return false
	        }
	      })(),
	    formData: 'FormData' in self,
	    arrayBuffer: 'ArrayBuffer' in self
	  };

	  function isDataView(obj) {
	    return obj && DataView.prototype.isPrototypeOf(obj)
	  }

	  if (support.arrayBuffer) {
	    var viewClasses = [
	      '[object Int8Array]',
	      '[object Uint8Array]',
	      '[object Uint8ClampedArray]',
	      '[object Int16Array]',
	      '[object Uint16Array]',
	      '[object Int32Array]',
	      '[object Uint32Array]',
	      '[object Float32Array]',
	      '[object Float64Array]'
	    ];

	    var isArrayBufferView =
	      ArrayBuffer.isView ||
	      function(obj) {
	        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
	      };
	  }

	  function normalizeName(name) {
	    if (typeof name !== 'string') {
	      name = String(name);
	    }
	    if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
	      throw new TypeError('Invalid character in header field name')
	    }
	    return name.toLowerCase()
	  }

	  function normalizeValue(value) {
	    if (typeof value !== 'string') {
	      value = String(value);
	    }
	    return value
	  }

	  // Build a destructive iterator for the value list
	  function iteratorFor(items) {
	    var iterator = {
	      next: function() {
	        var value = items.shift();
	        return {done: value === undefined, value: value}
	      }
	    };

	    if (support.iterable) {
	      iterator[Symbol.iterator] = function() {
	        return iterator
	      };
	    }

	    return iterator
	  }

	  function Headers(headers) {
	    this.map = {};

	    if (headers instanceof Headers) {
	      headers.forEach(function(value, name) {
	        this.append(name, value);
	      }, this);
	    } else if (Array.isArray(headers)) {
	      headers.forEach(function(header) {
	        this.append(header[0], header[1]);
	      }, this);
	    } else if (headers) {
	      Object.getOwnPropertyNames(headers).forEach(function(name) {
	        this.append(name, headers[name]);
	      }, this);
	    }
	  }

	  Headers.prototype.append = function(name, value) {
	    name = normalizeName(name);
	    value = normalizeValue(value);
	    var oldValue = this.map[name];
	    this.map[name] = oldValue ? oldValue + ', ' + value : value;
	  };

	  Headers.prototype['delete'] = function(name) {
	    delete this.map[normalizeName(name)];
	  };

	  Headers.prototype.get = function(name) {
	    name = normalizeName(name);
	    return this.has(name) ? this.map[name] : null
	  };

	  Headers.prototype.has = function(name) {
	    return this.map.hasOwnProperty(normalizeName(name))
	  };

	  Headers.prototype.set = function(name, value) {
	    this.map[normalizeName(name)] = normalizeValue(value);
	  };

	  Headers.prototype.forEach = function(callback, thisArg) {
	    for (var name in this.map) {
	      if (this.map.hasOwnProperty(name)) {
	        callback.call(thisArg, this.map[name], name, this);
	      }
	    }
	  };

	  Headers.prototype.keys = function() {
	    var items = [];
	    this.forEach(function(value, name) {
	      items.push(name);
	    });
	    return iteratorFor(items)
	  };

	  Headers.prototype.values = function() {
	    var items = [];
	    this.forEach(function(value) {
	      items.push(value);
	    });
	    return iteratorFor(items)
	  };

	  Headers.prototype.entries = function() {
	    var items = [];
	    this.forEach(function(value, name) {
	      items.push([name, value]);
	    });
	    return iteratorFor(items)
	  };

	  if (support.iterable) {
	    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
	  }

	  function consumed(body) {
	    if (body.bodyUsed) {
	      return Promise.reject(new TypeError('Already read'))
	    }
	    body.bodyUsed = true;
	  }

	  function fileReaderReady(reader) {
	    return new Promise(function(resolve, reject) {
	      reader.onload = function() {
	        resolve(reader.result);
	      };
	      reader.onerror = function() {
	        reject(reader.error);
	      };
	    })
	  }

	  function readBlobAsArrayBuffer(blob) {
	    var reader = new FileReader();
	    var promise = fileReaderReady(reader);
	    reader.readAsArrayBuffer(blob);
	    return promise
	  }

	  function readBlobAsText(blob) {
	    var reader = new FileReader();
	    var promise = fileReaderReady(reader);
	    reader.readAsText(blob);
	    return promise
	  }

	  function readArrayBufferAsText(buf) {
	    var view = new Uint8Array(buf);
	    var chars = new Array(view.length);

	    for (var i = 0; i < view.length; i++) {
	      chars[i] = String.fromCharCode(view[i]);
	    }
	    return chars.join('')
	  }

	  function bufferClone(buf) {
	    if (buf.slice) {
	      return buf.slice(0)
	    } else {
	      var view = new Uint8Array(buf.byteLength);
	      view.set(new Uint8Array(buf));
	      return view.buffer
	    }
	  }

	  function Body() {
	    this.bodyUsed = false;

	    this._initBody = function(body) {
	      this._bodyInit = body;
	      if (!body) {
	        this._bodyText = '';
	      } else if (typeof body === 'string') {
	        this._bodyText = body;
	      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
	        this._bodyBlob = body;
	      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
	        this._bodyFormData = body;
	      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	        this._bodyText = body.toString();
	      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
	        this._bodyArrayBuffer = bufferClone(body.buffer);
	        // IE 10-11 can't handle a DataView body.
	        this._bodyInit = new Blob([this._bodyArrayBuffer]);
	      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
	        this._bodyArrayBuffer = bufferClone(body);
	      } else {
	        this._bodyText = body = Object.prototype.toString.call(body);
	      }

	      if (!this.headers.get('content-type')) {
	        if (typeof body === 'string') {
	          this.headers.set('content-type', 'text/plain;charset=UTF-8');
	        } else if (this._bodyBlob && this._bodyBlob.type) {
	          this.headers.set('content-type', this._bodyBlob.type);
	        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
	        }
	      }
	    };

	    if (support.blob) {
	      this.blob = function() {
	        var rejected = consumed(this);
	        if (rejected) {
	          return rejected
	        }

	        if (this._bodyBlob) {
	          return Promise.resolve(this._bodyBlob)
	        } else if (this._bodyArrayBuffer) {
	          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as blob')
	        } else {
	          return Promise.resolve(new Blob([this._bodyText]))
	        }
	      };

	      this.arrayBuffer = function() {
	        if (this._bodyArrayBuffer) {
	          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
	        } else {
	          return this.blob().then(readBlobAsArrayBuffer)
	        }
	      };
	    }

	    this.text = function() {
	      var rejected = consumed(this);
	      if (rejected) {
	        return rejected
	      }

	      if (this._bodyBlob) {
	        return readBlobAsText(this._bodyBlob)
	      } else if (this._bodyArrayBuffer) {
	        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
	      } else if (this._bodyFormData) {
	        throw new Error('could not read FormData body as text')
	      } else {
	        return Promise.resolve(this._bodyText)
	      }
	    };

	    if (support.formData) {
	      this.formData = function() {
	        return this.text().then(decode)
	      };
	    }

	    this.json = function() {
	      return this.text().then(JSON.parse)
	    };

	    return this
	  }

	  // HTTP methods whose capitalization should be normalized
	  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

	  function normalizeMethod(method) {
	    var upcased = method.toUpperCase();
	    return methods.indexOf(upcased) > -1 ? upcased : method
	  }

	  function Request(input, options) {
	    options = options || {};
	    var body = options.body;

	    if (input instanceof Request) {
	      if (input.bodyUsed) {
	        throw new TypeError('Already read')
	      }
	      this.url = input.url;
	      this.credentials = input.credentials;
	      if (!options.headers) {
	        this.headers = new Headers(input.headers);
	      }
	      this.method = input.method;
	      this.mode = input.mode;
	      this.signal = input.signal;
	      if (!body && input._bodyInit != null) {
	        body = input._bodyInit;
	        input.bodyUsed = true;
	      }
	    } else {
	      this.url = String(input);
	    }

	    this.credentials = options.credentials || this.credentials || 'same-origin';
	    if (options.headers || !this.headers) {
	      this.headers = new Headers(options.headers);
	    }
	    this.method = normalizeMethod(options.method || this.method || 'GET');
	    this.mode = options.mode || this.mode || null;
	    this.signal = options.signal || this.signal;
	    this.referrer = null;

	    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
	      throw new TypeError('Body not allowed for GET or HEAD requests')
	    }
	    this._initBody(body);
	  }

	  Request.prototype.clone = function() {
	    return new Request(this, {body: this._bodyInit})
	  };

	  function decode(body) {
	    var form = new FormData();
	    body
	      .trim()
	      .split('&')
	      .forEach(function(bytes) {
	        if (bytes) {
	          var split = bytes.split('=');
	          var name = split.shift().replace(/\+/g, ' ');
	          var value = split.join('=').replace(/\+/g, ' ');
	          form.append(decodeURIComponent(name), decodeURIComponent(value));
	        }
	      });
	    return form
	  }

	  function parseHeaders(rawHeaders) {
	    var headers = new Headers();
	    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
	    // https://tools.ietf.org/html/rfc7230#section-3.2
	    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
	    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
	      var parts = line.split(':');
	      var key = parts.shift().trim();
	      if (key) {
	        var value = parts.join(':').trim();
	        headers.append(key, value);
	      }
	    });
	    return headers
	  }

	  Body.call(Request.prototype);

	  function Response(bodyInit, options) {
	    if (!options) {
	      options = {};
	    }

	    this.type = 'default';
	    this.status = options.status === undefined ? 200 : options.status;
	    this.ok = this.status >= 200 && this.status < 300;
	    this.statusText = 'statusText' in options ? options.statusText : 'OK';
	    this.headers = new Headers(options.headers);
	    this.url = options.url || '';
	    this._initBody(bodyInit);
	  }

	  Body.call(Response.prototype);

	  Response.prototype.clone = function() {
	    return new Response(this._bodyInit, {
	      status: this.status,
	      statusText: this.statusText,
	      headers: new Headers(this.headers),
	      url: this.url
	    })
	  };

	  Response.error = function() {
	    var response = new Response(null, {status: 0, statusText: ''});
	    response.type = 'error';
	    return response
	  };

	  var redirectStatuses = [301, 302, 303, 307, 308];

	  Response.redirect = function(url, status) {
	    if (redirectStatuses.indexOf(status) === -1) {
	      throw new RangeError('Invalid status code')
	    }

	    return new Response(null, {status: status, headers: {location: url}})
	  };

	  exports.DOMException = self.DOMException;
	  try {
	    new exports.DOMException();
	  } catch (err) {
	    exports.DOMException = function(message, name) {
	      this.message = message;
	      this.name = name;
	      var error = Error(message);
	      this.stack = error.stack;
	    };
	    exports.DOMException.prototype = Object.create(Error.prototype);
	    exports.DOMException.prototype.constructor = exports.DOMException;
	  }

	  function fetch(input, init) {
	    return new Promise(function(resolve, reject) {
	      var request = new Request(input, init);

	      if (request.signal && request.signal.aborted) {
	        return reject(new exports.DOMException('Aborted', 'AbortError'))
	      }

	      var xhr = new XMLHttpRequest();

	      function abortXhr() {
	        xhr.abort();
	      }

	      xhr.onload = function() {
	        var options = {
	          status: xhr.status,
	          statusText: xhr.statusText,
	          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
	        };
	        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
	        var body = 'response' in xhr ? xhr.response : xhr.responseText;
	        resolve(new Response(body, options));
	      };

	      xhr.onerror = function() {
	        reject(new TypeError('Network request failed'));
	      };

	      xhr.ontimeout = function() {
	        reject(new TypeError('Network request failed'));
	      };

	      xhr.onabort = function() {
	        reject(new exports.DOMException('Aborted', 'AbortError'));
	      };

	      xhr.open(request.method, request.url, true);

	      if (request.credentials === 'include') {
	        xhr.withCredentials = true;
	      } else if (request.credentials === 'omit') {
	        xhr.withCredentials = false;
	      }

	      if ('responseType' in xhr && support.blob) {
	        xhr.responseType = 'blob';
	      }

	      request.headers.forEach(function(value, name) {
	        xhr.setRequestHeader(name, value);
	      });

	      if (request.signal) {
	        request.signal.addEventListener('abort', abortXhr);

	        xhr.onreadystatechange = function() {
	          // DONE (success or failure)
	          if (xhr.readyState === 4) {
	            request.signal.removeEventListener('abort', abortXhr);
	          }
	        };
	      }

	      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
	    })
	  }

	  fetch.polyfill = true;

	  if (!self.fetch) {
	    self.fetch = fetch;
	    self.Headers = Headers;
	    self.Request = Request;
	    self.Response = Response;
	  }

	  exports.Headers = Headers;
	  exports.Request = Request;
	  exports.Response = Response;
	  exports.fetch = fetch;

	  return exports;

	}({}));
	})(__self__);
	delete __self__.fetch.polyfill;
	exports = __self__.fetch; // To enable: import fetch from 'cross-fetch'
	exports.default = __self__.fetch; // For TypeScript consumers without esModuleInterop.
	exports.fetch = __self__.fetch; // To enable: import {fetch} from 'cross-fetch'
	exports.Headers = __self__.Headers;
	exports.Request = __self__.Request;
	exports.Response = __self__.Response;
	module.exports = exports;
	});

	class EngageError extends Error {
	  constructor (message, cause) {
	    super(message);
	    this.cause = cause;
	    this.name = 'EngageError';
	  }
	}
	var error = EngageError;

	const root = 'https://api.engage.so';
	if (typeof btoa === 'undefined') {
	  commonjsGlobal.btoa = function (str) {
	    return Buffer.from(str).toString('base64')
	  };
	}

	const options = {
	  key: null,
	  secret: ''
	};

	async function _request (url, params, method) {
	  try {
	    const response = await browserPonyfill(url, {
	      method,
	      headers: {
	        'Content-Type': 'application/json;charset=utf-8',
	        Authorization: `Basic ${btoa(`${options.key}:${options.secret}`)}`
	      },
	      body: JSON.stringify(params)
	    });
	    const body = await response.json();
	    let error = 'API connection error';
	    if (!response.ok) {
	      if (body && body.error) {
	        error = body.error;
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
	};

	const init = (o) => {
	  if (!o) {
	    throw new error('You need to pass in your API key')
	  }
	  if (typeof o === 'string') {
	    options.key = o;
	    return
	  }

	  if (!o.key) {
	    throw new error('`key` missing in object')
	  }
	  if (o.key) {
	    options.key = `${o.key}`;
	  }
	  if (o.secret) {
	    options.secret = `${o.secret}`;
	  }
	};

	const identify = async (o) => {
	  if (!o) {
	    throw new error('You need to pass an object with at least an id and email.')
	  }
	  if (!o.id) {
	    throw new error('ID missing.')
	  }
	  if (o.email && !/^\S+@\S+$/.test(o.email)) {
	    throw new error('Email invalid.')
	  }
	  const allowed = ['id', 'email', 'number', 'created_at', 'device_token', 'device_platform', 'first_name', 'last_name'];
	  const params = {
	    meta: {}
	  };
	  Object.keys(o).map(k => {
	    if (allowed.indexOf(k) !== -1) {
	      params[k] = o[k];
	    } else {
	      params.meta[k] = o[k];
	    }
	  });

	  return _request(`${root}/users/${o.id}`, params, 'PUT')
	};

	const addAttribute = async (uid, data) => {
	  if (!uid) {
	    throw new error('User id missing')
	  }
	  if (!data) {
	    throw new error('Attributes missing')
	  }
	  if (!Object.keys(data).length) {
	    throw new error('Attributes missing')
	  }
	  const notMeta = ['created_at', 'number', 'device_token', 'device_platform', 'email', 'first_name', 'last_name'];
	  const params = { meta: {} };
	  Object.keys(data).map(k => {
	    if (notMeta.indexOf(k) === -1) {
	      params.meta[k] = data[k];
	    } else {
	      params[k] = data[k];
	    }
	  });

	  return _request(`${root}/users/${uid}`, params, 'PUT')
	};

	const track = async (uid, data) => {
	  if (!uid) {
	    throw new error('User id missing')
	  }
	  if (!data) {
	    throw new error('Attributes missing')
	  }
	  if (typeof data === 'string') {
	    data = {
	      event: data,
	      value: true
	    };
	  } else {
	    if (!Object.keys(data).length) {
	      throw new error('Attributes missing')
	    }
	  }

	  return _request(`${root}/users/${uid}/events`, data, 'POST')
	};

	var core = {
	  init,
	  identify,
	  addAttribute,
	  track,
	  request
	};

	let uid;
	let channel;
	let framePort;
	let engageIframe;

	function loadScript (url, callback) {
	  var script = document.createElement('script');
	  script.type = 'text/javascript';
	  script.src = url;

	  script.onreadystatechange = callback;
	  script.onload = callback;

	  document.getElementsByTagName('head').item(0).appendChild(script);
	}

	function loadMessageFrame (onLoad) {
	  if (document.getElementById('engage_wp_frame')) {
	    return
	  }
	  channel = new MessageChannel();
	  framePort = channel.port1;
	  framePort.onmessage = onMessage;

	  const w = window.innerWidth < 520 ? '100%' : '520px';

	  engageIframe = document.createElement('iframe');
	  engageIframe.src = 'https://d2969mkc0xw38n.cloudfront.net/widget/widget_1.1.0.html';
	  engageIframe.id = 'engage_wp_frame';
	  engageIframe.style = 'border:0;width:' + w + ';position:fixed;height:330px;bottom:0;right:0;z-index:10';
	  document.body.appendChild(engageIframe);
	  // Let it load
	  engageIframe.addEventListener('load', onLoad);
	}

	function updateContent (data) {
	  if (engageIframe.style.display === 'none') {
	    engageIframe.style.display = 'block';
	  }
	  framePort.postMessage(data);
	}

	async function checkNew () {
	  // Is there new content?
	  try {
	    const pending = await core.request('/v1/messages/push/latest?uid=' + uid);
	    if (pending && pending.msg_id) {
	      console.log('sending.....');
	      if (!engageIframe) {
	        loadMessageFrame(() => {
	          engageIframe.contentWindow.postMessage({
	            h: window.innerHeight
	          }, '*', [channel.port2]);
	          updateContent(pending);
	        });
	      } else {
	        updateContent(pending);
	      }
	    }
	  } catch (e) {
	    console.log(e);
	  }
	}

	function onMessage (e) {
	  const data = e.data;
	  if (data.action === 'resize' && engageIframe.style.display !== 'none') {
	    if (data.height > window.innerHeight) {
	      data.height = window.innerHeight - 55;
	    }
	    engageIframe.style.height = data.height + 'px';
	    return
	  }
	  if (data.action === 'close') {
	    // Mark as read on close #todo
	    // Hide frame
	    engageIframe.style.display = 'none';
	    engageIframe.style.height = '330px';
	  }
	}

	// Run pending queues
	const queue = window.engage && window.engage.queue ? window.engage.queue.slice(0) : [];
	// const queue = []
	for (const q of queue) {
	  if (q[0] === 'identify' && q[1] && q[1].id) {
	    uid = q[1].id;
	  } else if (!uid && q[0] === 'track' && q[1]) {
	    uid = q[1];
	  }
	  core[q[0]].apply(core, q.splice(1));
	}

	if (uid) {
	  // Add iframe
	  // Include Socket client
	  loadScript('https://cdn.socket.io/4.1.1/socket.io.min.js', () => {
	    const socket = io('https://ws.engage.so/webpush');
	    socket.on('connect', () => {
	      socket.emit('room', uid);
	    });
	    socket.on('webpush/notification', (data) => {
	      if (!engageIframe) {
	        loadMessageFrame(() => {
	          const m = { h: window.innerHeight };
	          engageIframe.contentWindow.postMessage(m, '*', [channel.port2]);
	          updateContent(data);
	        });
	      } else {
	        updateContent(data);
	      }
	    });
	  });

	  // Does user have pending messages?
	  checkNew();
	}

	var browser = core;

	return browser;

})));
