/**
 * Version: 2.1.1; 2024-07-09
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('buffer')) :
	typeof define === 'function' && define.amd ? define(['buffer'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Engage = factory(global.require$$0));
})(this, (function (require$$0) { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var dist = {};

	var browserPonyfill = {exports: {}};

	(function (module, exports) {
		// Save global object in a variable
		var __global__ =
		(typeof globalThis !== 'undefined' && globalThis) ||
		(typeof self !== 'undefined' && self) ||
		(typeof commonjsGlobal !== 'undefined' && commonjsGlobal);
		// Create an object that extends from __global__ without the fetch function
		var __globalThis__ = (function () {
		function F() {
		this.fetch = false;
		this.DOMException = __global__.DOMException;
		}
		F.prototype = __global__; // Needed for feature detection on whatwg-fetch's code
		return new F();
		})();
		// Wraps whatwg-fetch with a function scope to hijack the global object
		// "globalThis" that's going to be patched
		(function(globalThis) {

		((function (exports) {

		  var global =
		    (typeof globalThis !== 'undefined' && globalThis) ||
		    (typeof self !== 'undefined' && self) ||
		    (typeof global !== 'undefined' && global);

		  var support = {
		    searchParams: 'URLSearchParams' in global,
		    iterable: 'Symbol' in global && 'iterator' in Symbol,
		    blob:
		      'FileReader' in global &&
		      'Blob' in global &&
		      (function() {
		        try {
		          new Blob();
		          return true
		        } catch (e) {
		          return false
		        }
		      })(),
		    formData: 'FormData' in global,
		    arrayBuffer: 'ArrayBuffer' in global
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
		    if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
		      throw new TypeError('Invalid character in header field name: "' + name + '"')
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
		      /*
		        fetch-mock wraps the Response object in an ES6 Proxy to
		        provide useful test harness features such as flush. However, on
		        ES5 browsers without fetch or Proxy support pollyfills must be used;
		        the proxy-pollyfill is unable to proxy an attribute unless it exists
		        on the object before the Proxy is created. This change ensures
		        Response.bodyUsed exists on the instance, while maintaining the
		        semantic of setting Request.bodyUsed in the constructor before
		        _initBody is called.
		      */
		      this.bodyUsed = this.bodyUsed;
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
		          var isConsumed = consumed(this);
		          if (isConsumed) {
		            return isConsumed
		          }
		          if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
		            return Promise.resolve(
		              this._bodyArrayBuffer.buffer.slice(
		                this._bodyArrayBuffer.byteOffset,
		                this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength
		              )
		            )
		          } else {
		            return Promise.resolve(this._bodyArrayBuffer)
		          }
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
		    if (!(this instanceof Request)) {
		      throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
		    }

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

		    if (this.method === 'GET' || this.method === 'HEAD') {
		      if (options.cache === 'no-store' || options.cache === 'no-cache') {
		        // Search for a '_' parameter in the query string
		        var reParamSearch = /([?&])_=[^&]*/;
		        if (reParamSearch.test(this.url)) {
		          // If it already exists then set the value with the current time
		          this.url = this.url.replace(reParamSearch, '$1_=' + new Date().getTime());
		        } else {
		          // Otherwise add a new '_' parameter to the end with the current time
		          var reQueryString = /\?/;
		          this.url += (reQueryString.test(this.url) ? '&' : '?') + '_=' + new Date().getTime();
		        }
		      }
		    }
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
		    // Avoiding split via regex to work around a common IE11 bug with the core-js 3.6.0 regex polyfill
		    // https://github.com/github/fetch/issues/748
		    // https://github.com/zloirock/core-js/issues/751
		    preProcessedHeaders
		      .split('\r')
		      .map(function(header) {
		        return header.indexOf('\n') === 0 ? header.substr(1, header.length) : header
		      })
		      .forEach(function(line) {
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
		    if (!(this instanceof Response)) {
		      throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
		    }
		    if (!options) {
		      options = {};
		    }

		    this.type = 'default';
		    this.status = options.status === undefined ? 200 : options.status;
		    this.ok = this.status >= 200 && this.status < 300;
		    this.statusText = options.statusText === undefined ? '' : '' + options.statusText;
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

		  exports.DOMException = global.DOMException;
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
		        setTimeout(function() {
		          resolve(new Response(body, options));
		        }, 0);
		      };

		      xhr.onerror = function() {
		        setTimeout(function() {
		          reject(new TypeError('Network request failed'));
		        }, 0);
		      };

		      xhr.ontimeout = function() {
		        setTimeout(function() {
		          reject(new TypeError('Network request failed'));
		        }, 0);
		      };

		      xhr.onabort = function() {
		        setTimeout(function() {
		          reject(new exports.DOMException('Aborted', 'AbortError'));
		        }, 0);
		      };

		      function fixUrl(url) {
		        try {
		          return url === '' && global.location.href ? global.location.href : url
		        } catch (e) {
		          return url
		        }
		      }

		      xhr.open(request.method, fixUrl(request.url), true);

		      if (request.credentials === 'include') {
		        xhr.withCredentials = true;
		      } else if (request.credentials === 'omit') {
		        xhr.withCredentials = false;
		      }

		      if ('responseType' in xhr) {
		        if (support.blob) {
		          xhr.responseType = 'blob';
		        } else if (
		          support.arrayBuffer &&
		          request.headers.get('Content-Type') &&
		          request.headers.get('Content-Type').indexOf('application/octet-stream') !== -1
		        ) {
		          xhr.responseType = 'arraybuffer';
		        }
		      }

		      if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers)) {
		        Object.getOwnPropertyNames(init.headers).forEach(function(name) {
		          xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
		        });
		      } else {
		        request.headers.forEach(function(value, name) {
		          xhr.setRequestHeader(name, value);
		        });
		      }

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

		  if (!global.fetch) {
		    global.fetch = fetch;
		    global.Headers = Headers;
		    global.Request = Request;
		    global.Response = Response;
		  }

		  exports.Headers = Headers;
		  exports.Request = Request;
		  exports.Response = Response;
		  exports.fetch = fetch;

		  return exports;

		}))({});
		})(__globalThis__);
		// This is a ponyfill, so...
		__globalThis__.fetch.ponyfill = true;
		delete __globalThis__.fetch.polyfill;
		// Choose between native implementation (__global__) or custom implementation (__globalThis__)
		var ctx = __global__.fetch ? __global__ : __globalThis__;
		exports = ctx.fetch; // To enable: import fetch from 'cross-fetch'
		exports.default = ctx.fetch; // For TypeScript consumers without esModuleInterop.
		exports.fetch = ctx.fetch; // To enable: import {fetch} from 'cross-fetch'
		exports.Headers = ctx.Headers;
		exports.Request = ctx.Request;
		exports.Response = ctx.Response;
		module.exports = exports; 
	} (browserPonyfill, browserPonyfill.exports));

	var browserPonyfillExports = browserPonyfill.exports;

	var error = {};

	Object.defineProperty(error, "__esModule", { value: true });
	error.EngageError = void 0;
	class EngageError extends Error {
	    constructor(message) {
	        super(message);
	        this.name = 'EngageError';
	    }
	}
	error.EngageError = EngageError;

	var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(dist, "__esModule", { value: true });
	dist.convertToAccount = dist.convertToCustomer = dist.changeAccountRole = dist.removeFromAccount = dist.addToAccount = dist.merge = dist.track = dist.addAttribute = dist.identify = dist.init = dist.request = void 0;
	const buffer_1 = require$$0;
	const cross_fetch_1 = __importDefault(browserPonyfillExports);
	const error_1 = error;
	if (typeof btoa === 'undefined') {
	    commonjsGlobal.btoa = function (str) {
	        return buffer_1.Buffer.from(str).toString('base64');
	    };
	}
	// type UserIdentifyParams = {
	//   id: string
	//   [key: string]: string | number | Date | boolean
	// }
	// type UserAttrParams = Omit<UserIdentifyParams, 'id'>
	// const rootURL = 'https://api.engage.so/v1'
	let auth = '';
	const notMeta = ['created_at', 'is_account', 'number', 'device_token', 'device_platform', 'email', 'first_name', 'last_name', 'tz', 'app_version', 'app_build', 'app_last_active'];
	const apiRoot = 'https://api.engage.so/v1';
	function _request(url, params, method) {
	    return __awaiter(this, void 0, void 0, function* () {
	        try {
	            const o = {
	                method,
	                headers: {
	                    'Content-Type': 'application/json;charset=utf-8',
	                    Authorization: `Basic ${auth}`
	                },
	                // throwHttpErrors: false,
	                // prefixUrl: rootURL
	            };
	            if (params) {
	                o.body = JSON.stringify(params);
	            }
	            // const response = await ky(url, o)
	            const response = yield (0, cross_fetch_1.default)(`${apiRoot}${url}`, o);
	            const body = yield response.json();
	            let error = 'API connection error';
	            if (!response.ok) {
	                if (body && body.error) {
	                    error = body.error;
	                }
	                return { error };
	            }
	            return body;
	        }
	        catch (e) {
	            return { error: 'API connection error' };
	        }
	    });
	}
	// Alias of _request method
	// Same with _request for now but can later have modifications
	function request(url, params, method) {
	    return _request(url, params, method);
	}
	dist.request = request;
	function init(key) {
	    if (!key) {
	        throw new error_1.EngageError('You need to pass in your API key(s).');
	    }
	    const options = {
	        key: undefined,
	        secret: ''
	    };
	    if (typeof key === 'string') {
	        options.key = key;
	    }
	    else {
	        if (!key.key) {
	            throw new error_1.EngageError('`key` missing in object.');
	        }
	        if (key.key) {
	            options.key = `${key.key}`;
	        }
	        if (key.secret) {
	            options.secret = `${key.secret}`;
	        }
	    }
	    // Set auth
	    // auth = Buffer.from(`${options.key}:${options.secret}`).toString('base64')
	    auth = btoa(`${options.key}:${options.secret}`);
	}
	dist.init = init;
	// Data tracking
	function identify(user) {
	    return __awaiter(this, void 0, void 0, function* () {
	        if (!user) {
	            throw new error_1.EngageError('You need to pass an object with at least an id.');
	        }
	        if (!user.id) {
	            throw new error_1.EngageError('ID missing.');
	        }
	        if (user.email && (typeof user.email !== 'string' || !/^\S+@\S+$/.test(user.email))) {
	            throw new error_1.EngageError('Email invalid.');
	        }
	        const params = {};
	        params.meta = {};
	        for (const k in user) {
	            if (k === 'id' || notMeta.includes(k)) {
	                params[k] = user[k];
	            }
	            else {
	                params.meta[k] = user[k];
	            }
	        }
	        return _request(`/users/${user.id}`, params, 'PUT');
	    });
	}
	dist.identify = identify;
	function addAttribute(uid, attributes) {
	    return __awaiter(this, void 0, void 0, function* () {
	        if (!uid) {
	            throw new error_1.EngageError('User ID missing.');
	        }
	        if (!attributes) {
	            throw new error_1.EngageError('Attributes missing.');
	        }
	        if (!Object.keys(attributes).length) {
	            throw new error_1.EngageError('Attributes missing.');
	        }
	        const params = {};
	        params.meta = {};
	        for (const k in attributes) {
	            if (notMeta.includes(k)) {
	                params[k] = attributes[k];
	            }
	            else {
	                params.meta[k] = attributes[k];
	            }
	        }
	        if (!Object.keys(params.meta).length) {
	            delete params.meta;
	        }
	        return _request(`/users/${uid}`, params, 'PUT');
	    });
	}
	dist.addAttribute = addAttribute;
	function track(uid, data) {
	    return __awaiter(this, void 0, void 0, function* () {
	        if (!uid) {
	            throw new error_1.EngageError('User ID missing.');
	        }
	        if (!data) {
	            throw new error_1.EngageError('Event data missing.');
	        }
	        if (typeof data === 'string') {
	            data = {
	                event: data,
	                value: true
	            };
	        }
	        else {
	            if (!Object.keys(data).length) {
	                throw new error_1.EngageError('Attributes missing.');
	            }
	        }
	        return _request(`/users/${uid}/events`, data, 'POST');
	    });
	}
	dist.track = track;
	function merge(sourceUid, destinationUid) {
	    return __awaiter(this, void 0, void 0, function* () {
	        if (!sourceUid) {
	            throw new error_1.EngageError('Source ID missing.');
	        }
	        if (!destinationUid) {
	            throw new error_1.EngageError('Destination ID missing.');
	        }
	        return _request(`/users/merge`, {
	            source: sourceUid,
	            destination: destinationUid
	        }, 'POST');
	    });
	}
	dist.merge = merge;
	// Account functions
	function addToAccount(uid, accountId, role) {
	    return __awaiter(this, void 0, void 0, function* () {
	        if (!uid) {
	            throw new error_1.EngageError('User ID missing.');
	        }
	        if (!accountId) {
	            throw new error_1.EngageError('Account ID missing.');
	        }
	        if (role && typeof role !== 'string') {
	            throw new error_1.EngageError('Role should be a text.');
	        }
	        const g = {
	            id: accountId
	        };
	        if (role) {
	            g.role = role;
	        }
	        return _request(`/users/${uid}/accounts`, { accounts: [g] }, 'POST');
	    });
	}
	dist.addToAccount = addToAccount;
	function removeFromAccount(uid, accountId) {
	    return __awaiter(this, void 0, void 0, function* () {
	        if (!uid) {
	            throw new error_1.EngageError('User ID missing.');
	        }
	        if (!accountId) {
	            throw new error_1.EngageError('Account ID missing.');
	        }
	        return _request(`/users/${uid}/accounts/${accountId}`, null, 'DELETE');
	    });
	}
	dist.removeFromAccount = removeFromAccount;
	function changeAccountRole(uid, accountId, role) {
	    return __awaiter(this, void 0, void 0, function* () {
	        if (!uid) {
	            throw new error_1.EngageError('User ID missing.');
	        }
	        if (!accountId) {
	            throw new error_1.EngageError('Account ID missing.');
	        }
	        if (!role) {
	            throw new error_1.EngageError('New role missing.');
	        }
	        return _request(`/users/${uid}/accounts/${accountId}`, { role }, 'PUT');
	    });
	}
	dist.changeAccountRole = changeAccountRole;
	function convertToCustomer(uid) {
	    return __awaiter(this, void 0, void 0, function* () {
	        if (!uid) {
	            throw new error_1.EngageError('User ID missing.');
	        }
	        return _request(`/users/${uid}/convert`, { type: 'customer' }, 'POST');
	    });
	}
	dist.convertToCustomer = convertToCustomer;
	function convertToAccount(uid) {
	    return __awaiter(this, void 0, void 0, function* () {
	        if (!uid) {
	            throw new error_1.EngageError('User ID missing.');
	        }
	        return _request(`/users/${uid}/convert`, { type: 'account' }, 'POST');
	    });
	}
	dist.convertToAccount = convertToAccount;

	const Engage = dist;

	function uuidv4 () {
	  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
	    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	  )
	}

	let key;
	let uid;
	let channel;
	let framePort;
	let h;
	const widgetIframe = document.createElement('iframe');
	const containerDiv = document.createElement('div');
	let docTitle = document.title;
	let badge = 0;

	function resize () {
	  const w = window.innerWidth < 360 ? '100%' : '360px';
	  h = window.innerHeight < 550 ? (window.innerHeight - 20) + 'px' : '550px';
	  widgetIframe.style.cssText = 'width:' + w + ';height:' + h;

	  framePort.postMessage({ ppties: {
	    h
	  }, type: 'set' });
	}

	function loadScript (url, callback) {
	  const script = document.createElement('script');
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
	  const styleSheet = document.createElement("style");
	  styleSheet.type = 'text/css';
	  document.getElementsByTagName("head")[0].appendChild(styleSheet);
	  if (styleSheet.styleSheet) {
	    // IE
	    styleSheet.styleSheet.cssText = styles;
	  } else {
	    // Other browsers
	    styleSheet.innerHTML = styles;
	  }

	  containerDiv.className = 'engage-widget-container no-chat';
	  widgetIframe.src = 'https://d2969mkc0xw38n.cloudfront.net/widget_v2/widget.html';
	  widgetIframe.id = 'engage_wp_frame';
	  const w = window.innerWidth < 360 ? '100%' : '360px';
	  h = window.innerHeight < 550 ? (window.innerHeight - 20) + 'px' : '550px';
	  widgetIframe.style.cssText = 'width:' + w + ';height:' + h;
	  containerDiv.appendChild(widgetIframe);
	  const iconDiv = document.createElement('div');
	  const button = document.createElement('button');
	  button.className = 'chat-btn';
	  button.innerHTML = '<span class="badge dn"></span><svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" fill="#ffffff" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M216,48H40A16,16,0,0,0,24,64V222.8a15.7,15.7,0,0,0,9.3,14.5,16,16,0,0,0,17-2.2L82,208.4l134-.4a16,16,0,0,0,16-16V64A16,16,0,0,0,216,48ZM160,152H96a8,8,0,0,1,0-16h64a8,8,0,0,1,0,16Zm0-32H96a8,8,0,0,1,0-16h64a8,8,0,0,1,0,16Z"></path></svg>';
	  button.addEventListener('click', () => {
	    toggleWidget();
	  });
	  iconDiv.appendChild(button);
	  containerDiv.appendChild(iconDiv);
	  document.body.appendChild(containerDiv);
	  widgetIframe.addEventListener('load', onLoad);
	}

	function updateButtonBadge() {
	  const el = containerDiv.querySelector('.badge');
	  if (!el) {
	    return
	  }
	  el.innerHTML = badge;
	  if (badge === 0 && !el.classList.contains('dn')) {
	    el.classList.add('dn');
	    return
	  }
	  if (badge && el.classList.contains('dn')) {
	    el.classList.remove('dn');
	    return
	  }
	}

	// Run pending queues
	const queue = window.engage && window.engage.queue ? window.engage.queue.slice(0) : [];
	for (const q of queue) {
	  if (q[0] === 'identify' && q[1] && q[1].id) {
	    uid = q[1].id;
	  // } else if (!uid && q[0] === 'track' && q[1]) {
	  //   uid = q[1]
	  } else if (!key && q[0] === 'init' && q[1]) {
	    key = q[1];
	  }
	  Engage[q[0]].apply(Engage, q.splice(1));
	}

	const sound = new Audio('https://d2969mkc0xw38n.cloudfront.net/cdn/misc/pop.mp3');
	let account;
	let wasDisconnected = false;
	let socket;
	let orgSocket;
	const cid = uuidv4();

	function onMessage (e) {
	  const data = e.data;
	  if (data.action === 'close') {
	    // Hide frame
	    containerDiv.classList.toggle('opened');
	  }
	  if (data.action === 'maximize') {
	    const w = window.innerWidth < 520 ? '100%' : '520px';
	    h = window.innerHeight < 650 ? (window.innerHeight - 20) + 'px' : '650px';
	    widgetIframe.style.cssText = 'width:' + w + ';height:' + h;

	    framePort.postMessage({ ppties: {
	      h
	    }, type: 'set' });
	  }
	  if (data.action === 'minimize') {
	    resize();
	  }
	  if (data.action === 'set_user') {
	    user.name = data.user.name;
	    user.email = data.user.email;
	    window.localStorage.setItem('engage_user', JSON.stringify({
	      uid,
	      name: data.user.name,
	      email: data.user.email
	    }));
	  }
	  if (data.action === 'send_chat') {
	    const params = {
	      body: data.body,
	      uid: user.uid,
	      cid
	    };
	    if (user.name) {
	      params.name = user.name;
	    }
	    if (user.email) {
	      params.email = user.email.trim().toLowerCase();
	    }
	    Engage.request('/messages/chat', params, 'POST')
	      .then(body => {
	        // Set uid
	        if (!body.uid) {
	          return
	        }
	        uidSet = true;
	        if (body.uid === user.uid) {
	          return
	        }
	        // If user sent anon id but exist on server w/ diff id
	        const uid = body.uid;
	        // Join new room
	        socket.emit('room', account.id+':'+uid);
	        user.uid = uid;
	        framePort.postMessage({ user, type: 'set' });
	        window.localStorage.setItem('engage_user', JSON.stringify(user));
	      });
	  }
	  if (data.action === 'ack') {
	    // Mark message as read
	    Engage.request('/messages/chat/ack', { id: data.id }, 'POST')
	      .then(() => {});
	  }
	  if (data.action === 'typing') {
	    orgSocket.emit(data.action, {
	      org: account.id,
	      parent_id: data.parent_id,
	      user: user.uid
	    });
	  }
	  if (data.action === 'stopped-typing') {
	    orgSocket.emit(data.action, {
	      org: account.id,
	      parent_id: data.parent_id,
	      user: user.uid
	    });
	  }
	}

	function toggleWidget () {
	  // Once window is visible, reset badge and title
	  if (!containerDiv.classList.contains('opened')) {
	    document.title = docTitle;
	    badge = 0;
	    updateButtonBadge();
	    // Clear welcome
	    const wd = document.querySelector('.engage-widget-container .welcome');
	    if (wd) {
	      wd.remove();
	    }
	  }
	  containerDiv.classList.toggle('opened');
	}

	function joinRoom () {
	  if (socket && account && account.id) {
	    socket.emit('room', account.id);
	    socket.emit('room', account.id+':'+uid);
	  }
	}

	function createWebPushFrame (body, o) {
	  body = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet"><style>* {box-sizing:border-box;padding:0;margin:0;}body{font-family:'Inter',sans-serif;padding:0 1em}h1,h2,h3,p{margin:0;padding:6px 0;color:inherit;}</style>
${body}
<img src="https://us-central1-suet-170506.cloudfunctions.net/ppx?s=o&d=${o.domain_id}&m=${o.msg_id}">`;
	  const div = document.createElement('div');
	  div.className = 'engage-widget-webia';
	  h = window.innerHeight < 550 ? (window.innerHeight - 50) + 'px' : '550px';
	  div.style.cssText = 'max-height:' + h;
	  // Close
	  const closeDiv = document.createElement('div');
	  closeDiv.style.cssText = 'padding:0 1em 0.5em 0;text-align:right';
	  const close = document.createElement('a');
	  close.setAttribute('href', '#');
	  close.innerHTML = `<svg width="24" height="24" style="width:24px;height:24px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></a>`;
	  close.addEventListener('click', (e) => {
	    e.preventDefault();
	    document.querySelector('.engage-widget-webia').remove();
	  });
	  closeDiv.appendChild(close);
	  div.appendChild(closeDiv);
	  // iframe
	  const iframe = document.createElement('iframe');
	  div.appendChild(iframe);
	  div.appendChild(iframe);
	  document.body.appendChild(div);
	  iframe.contentWindow.document.open();
	  iframe.contentWindow.document.write(body);
	  iframe.contentWindow.document.close();
	  iframe.onload = function() {
	    iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
	  };
	}

	loadScript('https://cdn.socket.io/4.5.4/socket.io.min.js', () => {
	  socket = io('https://ws.engage.so/webpush');
	  orgSocket = io('https://ws.engage.so/inbound');
	  socket.on('connect', async () => {
	    if (uid) {
	      joinRoom();
	      // Load pending messages here
	      if (wasDisconnected) {
	        // Load new messages here
	        try {
	          const chat = await Engage.request('/messages/chat/open?uid=' + uid + '&since=' + lastMsgId);
	          if (chat && chat.messages && chat.messages.length) {
	            lastMsgId = chat.messages[chat.messages.length - 1].id;
	            const opened = containerDiv.classList.contains('opened');
	            // Hidden or not?
	            if (document.visibilityState === 'hidden' || !opened) {
	              try {
	                sound.play();
	              } catch (e) {}
	              if (!opened) {
	                document.title = '* New message';
	                badge += chat.messages.length;
	                updateButtonBadge();
	              }
	            }
	            for (const m of chat.messages) {
	              framePort.postMessage({ data: m, type: 'new_message' });
	            }
	          }
	        } catch (e) {
	          console.warn(e);
	        }
	        wasDisconnected = false;
	      }
	    }
	  });
	  socket.on('disconnect', () => {
	    wasDisconnected = true;
	    // Attempt reconnecting
	    let delay = 2000;
	    setTimeout(function tick() {
	      if (!wasDisconnected) {
	        return
	      }
	      socket.connect();
	      delay *= 1.5;
	      setTimeout(tick, delay);
	    }, delay);
	  });
	  // Notify of online agents
	  socket.on('agents_online', (count) => {
	    setTimeout(function checkfp() {
	      if (framePort) {
	        framePort.postMessage({ agents_online: count, type: 'set' });
	      } else {
	        setTimeout(checkfp, 1000);
	      }
	    }, 0);
	  });
	  socket.on('webpush/notification', (data) => {
	    if (!data.type) {
	      return
	    }
	    const opened = containerDiv.classList.contains('opened');
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
	          uidSet = true;
	          uid = data.uid;
	          // Upgrade
	          // Join new room
	          socket.emit('room', account.id+':'+uid);
	          user.uid = uid;
	          if (data.from && data.from.email) {
	            user.email = data.from.email;
	          }
	          framePort.postMessage({ user, type: 'set' });
	          window.localStorage.setItem('engage_user', JSON.stringify(user));
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
	            sound.play();
	          } catch (e) {}
	          if (!opened) {
	            document.title = '* New message';
	            badge++;
	            updateButtonBadge();
	          }
	        }
	        // Send message to iframe and set view to chat already
	        framePort.postMessage({ data, type: 'new_message' });
	        lastMsgId = data.id;
	      }
	    }
	    if (['typing', 'stopped-typing'].includes(data.type)) {
	      framePort.postMessage({ type: data.type });
	    }
	    // Web inapp notifications
	    if (data.type === 'web' && !opened) {
	      // Only show if not opened
	      createWebPushFrame(data.body, data);
	    }
	  });
	});

	// Customer identified?
	const identified = !!uid;
	let uidSet = identified;
	let lastMsgId;
	let user = {};
	if (uid) {
	  user.uid = uid;
	}
	// 2. Load message frame first
	loadMessageFrame(async () => {
	  try {
	    account = await Engage.request('/account');
	    // Turn on chat icon
	    if (account.features && account.features.chat) {
	      containerDiv.classList.remove('no-chat');
	      if (account.features.chat.color) {
	        // Update stylesheet
	        const style = `.engage-widget-container .chat-btn {
          background-color: ${account.features.chat.color}
        }
        .engage-widget-container .chat-btn:hover {
        background-color: ${account.features.chat.color}e6;
        }`;
	        const styleSheet = document.createElement("style");
	        styleSheet.type = 'text/css';
	        document.getElementsByTagName("head")[0].appendChild(styleSheet);
	        if (styleSheet.styleSheet) {
	          // IE
	          styleSheet.styleSheet.cssText = style;
	        } else {
	          // Other browsers
	          styleSheet.innerHTML = style;
	        }
	      }
	      if (account.features.chat.welcome) {
	        const wDiv = document.createElement('div');
	        wDiv.addEventListener('click', () => {
	          toggleWidget();
	        });
	        wDiv.innerText = account.features.chat.welcome;

	        const closeDiv = document.createElement('div');
	        closeDiv.style.cssText = 'position:absolute;right:5px;top:5px';
	        const close = document.createElement('a');
	        close.setAttribute('href', '#');
	        close.innerHTML = `<svg width="18" height="18" style="width:18px;height:18px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></a>`;
	        close.addEventListener('click', (e) => {
	          e.preventDefault();
	          document.querySelector('.engage-widget-container .welcome').remove();
	        });
	        closeDiv.appendChild(close);

	        const msgDiv = document.createElement('div');
	        msgDiv.className = 'welcome';
	        msgDiv.appendChild(closeDiv);
	        msgDiv.appendChild(wDiv);
	        containerDiv.appendChild(msgDiv);
	      }
	    }
	  } catch (e) {
	    return console.warn(e)
	  }

	  if (!uid) {
	    // Is there an id in local storage?
	    const u = window.localStorage.getItem('engage_user');
	    if (u) {
	      try {
	        user = JSON.parse(u);
	        if (user.uid) {
	          uid = user.uid;
	        }
	      } catch (e) {}
	    }
	  }
	  if (!uid) {
	    // Generate anonymous id
	    uid = uuidv4();
	    user.uid = uid;
	    // and store
	    window.localStorage.setItem('engage_user', JSON.stringify({
	      uid
	    }));
	  }
	  joinRoom();
	  // Register port with widget
	  widgetIframe.contentWindow.postMessage(':)', '*', [channel.port2]);
	  // Set height
	  framePort.postMessage({ ppties: {
	    h
	  }, type: 'set' });
	  // Send uid
	  framePort.postMessage({ user, type: 'set' });
	  framePort.postMessage({ identified, type: 'set' });
	  // Send account
	  if (account) {
	    framePort.postMessage({ account, type: 'set' });
	  }

	  // 1. Is there any new chat message?
	  try {
	    const chat = await Engage.request('/messages/chat/open?uid=' + uid);
	    if (chat && chat.messages && chat.messages.length) {
	      framePort.postMessage({ chat, type: 'chat' });
	      lastMsgId = chat.messages[chat.messages.length - 1].id;
	      // How many unread messages?
	      for (const m of chat.messages) {
	        if (!m.outbound && !m.read) {
	          badge++;
	        }
	      }
	      if (badge) {
	        // Badge
	        updateButtonBadge();
	      }
	    }
	  } catch (e) {
	    console.warn(e);
	  }
	  // 2. Is there a new web push
	  try {
	    const msg = await Engage.request('/messages/push/latest?uid=' + uid);
	    if (msg && msg.body) {
	      const opened = containerDiv.classList.contains('opened');
	      if (!opened) {
	        createWebPushFrame(msg.body, msg);
	      }
	    }
	  } catch (e) {
	    console.warn(e);
	  }
	  // 3. Is there a banner
	  try {
	    const data = await Engage.request('/campaigns/banners/active?uid=' + uid + '&path=' + window.location.protocol + '//' + window.location.href);
	    const banner = document.createElement('div');
	    banner.className = 'engage-banner';
	    if (data) {
	      if (data.style === 'inline') {
	        let style = 'position:fixed;padding:1em;width:100%;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-sizing: border-box;';
	        style += data.position === 'top' ? 'top:0' : 'bottom:0';
	        style += ';background-color:';
	        style += data.bgcolor ? data.bgcolor : '#10273c';
	        style += ';color:';
	        style += data.color ? data.color : '#fff';

	        banner.style.cssText = style;
	        const cs = window.getComputedStyle(document.body);
	        const bkPosition = cs.getPropertyValue('position');
	        const bkMarginTop = cs.getPropertyValue('margin-top');
	        if (bkMarginTop) {
	          document.body.style.marginTop = (+(bkPosition.replace(/[^0-9]/g, '')) + 53) + 'px';
	        }
	        document.body.style.position = 'relative';
	        if (data.dismiss) {
	          const link = document.createElement('a');
	          link.href = '#';
	          link.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="stroke:currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
	          link.addEventListener('click', async (e) => {
	            e.preventDefault();
	            link.closest('.engage-banner').remove();
	            document.body.style.marginTop = bkMarginTop;
	            document.body.style.position = bkPosition;
	            // Track dismiss
	            await Engage.request('/campaigns/banners/' + data.id + '/track?uid=' + uid);
	          });
	          const fr = document.createElement('div');
	          fr.style.cssText = 'float:right';
	          fr.appendChild(link);
	          banner.appendChild(fr);
	        }
	        const el = document.createElement('span');
	        el.innerHTML = data.body;
	        banner.appendChild(el);
	      } else if (data.style === 'float') {
	        let style = 'z-index:99999;position:fixed;border-radius:.5rem;padding:1em;max-width:50%;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
	        if (data.position === 'tr') {
	          style += 'top: 10px; right: 10px';
	        } else if (data.position === 'tl') {
	          style += 'top: 10px; left: 10px';
	        } else if (data.position === 'bl') {
	          style += 'bottom: 10px; left: 10px';
	        } else if (data.position === 'br') {
	          style += 'bottom: 10px; right: 10px';
	        }
	        style += ';background-color:';
	        style += data.bgcolor ? data.bgcolor : '#10273c';
	        style += ';color:';
	        style += data.color ? data.color : '#fff';

	        banner.style.cssText = style;
	        banner.innerHTML = data.body;
	        if (data.dismiss) {
	          const link = document.createElement('a');
	          link.href = '#';
	          link.style.cssText = 'margin-left:10px';
	          link.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="stroke:currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
	          link.addEventListener('click', async (e) => {
	            e.preventDefault();
	            link.closest('.engage-banner').remove();
	            // track dismiss
	            await Engage.request('/campaigns/banners/' + data.id + '/track?uid=' + uid);
	          });
	          banner.appendChild(link);
	        }
	      }
	      // Todo: track display (unique)
	      document.body.insertBefore(banner, document.body.firstChild);
	    }
	  } catch (e) {
	    console.warn(e);
	  }

	  // todo: What about conversations?
	  // Get any data-help-id
	  const helpLinks = document.querySelectorAll('[data-help-id]');
	  for (const el of helpLinks) {
	    el.addEventListener('click', function(e) {
	      e.preventDefault();
	      const help = {
	        id: this.dataset.helpId
	      };
	      if (this.dataset.helpType) {
	        help.type = this.dataset.helpType;
	      }
	      if (this.dataset.helpLocale) {
	        help.locale = this.dataset.helpLocale;
	      }
	      framePort.postMessage({ help, type: 'action' });
	      if (!containerDiv.classList.contains('opened')) {
	        containerDiv.classList.add('opened');
	      }
	    });
	  }

	  // On resize
	  window.addEventListener('resize', () => {
	    resize();
	  });
	});

	// Button click
	Engage.openChat = function () {
	  toggleWidget();
	};
	Engage.openHelp = function (id, helpType, locale) {
	  const help = {
	    id
	  };
	  if (helpType) {
	    help.type = helpType;
	  }
	  if (locale) {
	    help.locale = locale;
	  }
	  framePort.postMessage({ help, type: 'action' });
	  if (!containerDiv.classList.contains('opened')) {
	    containerDiv.classList.add('opened');
	  }
	};

	// Override identify
	const _identify = Engage.identify;
	Engage.identify = function (u) {
	  if (u && u.id) {
	    uid = u.id;
	    user.uid = u.id;
	    joinRoom();
	    _identify(u);
	  }
	};

	var browser = Engage;

	var index = /*@__PURE__*/getDefaultExportFromCjs(browser);

	return index;

}));
