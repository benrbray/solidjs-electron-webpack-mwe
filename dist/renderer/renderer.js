module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("solid-js");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(2);


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./node_modules/solid-js/dist/index.js
let taskIdCounter = 1,
    isCallbackScheduled = false,
    isPerformingWork = false,
    taskQueue = [],
    currentTask = null,
    shouldYieldToHost = null,
    yieldInterval = 5,
    deadline = 0,
    maxYieldInterval = 300,
    scheduleCallback = null,
    scheduledCallback = null;
const maxSigned31BitInt = 1073741823;
function setupScheduler() {
  if (window && window.MessageChannel) {
    const channel = new MessageChannel(),
          port = channel.port2;
    scheduleCallback = () => port.postMessage(null);
    channel.port1.onmessage = () => {
      if (scheduledCallback !== null) {
        const currentTime = performance.now();
        deadline = currentTime + yieldInterval;
        const hasTimeRemaining = true;
        try {
          const hasMoreWork = scheduledCallback(hasTimeRemaining, currentTime);
          if (!hasMoreWork) {
            scheduledCallback = null;
          } else port.postMessage(null);
        } catch (error) {
          port.postMessage(null);
          throw error;
        }
      }
    };
  } else {
    let _callback;
    scheduleCallback = () => {
      if (!_callback) {
        _callback = scheduledCallback;
        setTimeout(() => {
          const currentTime = performance.now();
          deadline = currentTime + yieldInterval;
          const hasMoreWork = _callback(true, currentTime);
          _callback = null;
          if (hasMoreWork) scheduleCallback();
        }, 0);
      }
    };
  }
  if (navigator && navigator.scheduling && navigator.scheduling.isInputPending) {
    const scheduling = navigator.scheduling;
    shouldYieldToHost = () => {
      const currentTime = performance.now();
      if (currentTime >= deadline) {
        if (scheduling.isInputPending()) {
          return true;
        }
        return currentTime >= maxYieldInterval;
      } else {
        return false;
      }
    };
  } else {
    shouldYieldToHost = () => performance.now() >= deadline;
  }
}
function enqueue(taskQueue, task) {
  function findIndex() {
    let m = 0;
    let n = taskQueue.length - 1;
    while (m <= n) {
      let k = n + m >> 1;
      let cmp = task.expirationTime - taskQueue[k].expirationTime;
      if (cmp > 0) m = k + 1;else if (cmp < 0) n = k - 1;else return k;
    }
    return m;
  }
  taskQueue.splice(findIndex(), 0, task);
}
function requestCallback(fn, options) {
  if (!scheduleCallback) setupScheduler();
  let startTime = performance.now(),
      timeout = maxSigned31BitInt;
  if (options && options.timeout) timeout = options.timeout;
  const newTask = {
    id: taskIdCounter++,
    fn,
    startTime,
    expirationTime: startTime + timeout
  };
  enqueue(taskQueue, newTask);
  if (!isCallbackScheduled && !isPerformingWork) {
    isCallbackScheduled = true;
    scheduledCallback = flushWork;
    scheduleCallback();
  }
  return newTask;
}
function cancelCallback(task) {
  task.fn = null;
}
function flushWork(hasTimeRemaining, initialTime) {
  isCallbackScheduled = false;
  isPerformingWork = true;
  try {
    return workLoop(hasTimeRemaining, initialTime);
  } finally {
    currentTask = null;
    isPerformingWork = false;
  }
}
function workLoop(hasTimeRemaining, initialTime) {
  let currentTime = initialTime;
  currentTask = taskQueue[0] || null;
  while (currentTask !== null) {
    if (currentTask.expirationTime > currentTime && (!hasTimeRemaining || shouldYieldToHost())) {
      break;
    }
    const callback = currentTask.fn;
    if (callback !== null) {
      currentTask.fn = null;
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      callback(didUserCallbackTimeout);
      currentTime = performance.now();
      if (currentTask === taskQueue[0]) {
        taskQueue.shift();
      }
    } else taskQueue.shift();
    currentTask = taskQueue[0] || null;
  }
  return currentTask !== null;
}

const equalFn = (a, b) => a === b;
const ERROR = Symbol("error");
const NOTPENDING = {};
const STALE = 1;
const PENDING = 2;
const UNOWNED = {
  owned: null,
  cleanups: null,
  context: null,
  owner: null
};
let Owner = null;
let Listener = null;
let Pending = null;
let Updates = null;
let Afters = [];
let ExecCount = 0;
function createRoot(fn, detachedOwner) {
  detachedOwner && (Owner = detachedOwner);
  const listener = Listener,
        owner = Owner,
        root = fn.length === 0 ? UNOWNED : {
    owned: null,
    cleanups: null,
    context: null,
    owner
  };
  Owner = root;
  Listener = null;
  let result;
  try {
    result = fn(() => cleanNode(root));
  } catch (err) {
    const fns = lookup(Owner, ERROR);
    if (!fns) throw err;
    fns.forEach(f => f(err));
  } finally {
    while (Afters.length) Afters.shift()();
    Listener = listener;
    Owner = owner;
  }
  return result;
}
function createSignal(value, areEqual) {
  const s = {
    value,
    observers: null,
    observerSlots: null,
    pending: NOTPENDING,
    comparator: areEqual ? typeof areEqual === "function" ? areEqual : equalFn : undefined
  };
  return [readSignal.bind(s), writeSignal.bind(s)];
}
function createEffect(fn, value) {
  updateComputation(createComputation(fn, value));
}
function createDependentEffect(fn, deps, defer) {
  const resolved = Array.isArray(deps) ? callAll(deps) : deps;
  defer = !!defer;
  createEffect(value => {
    const listener = Listener;
    resolved();
    if (defer) defer = false;else {
      Listener = null;
      value = fn(value);
      Listener = listener;
    }
    return value;
  });
}
function createMemo(fn, value, areEqual) {
  const c = createComputation(fn, value);
  c.pending = NOTPENDING;
  c.observers = null;
  c.observerSlots = null;
  c.comparator = areEqual ? typeof areEqual === "function" ? areEqual : equalFn : undefined;
  updateComputation(c);
  return readSignal.bind(c);
}
function createDeferred(fn, options) {
  let t,
      timeout = options ? options.timeoutMs : undefined;
  const [deferred, setDeferred] = createSignal(fn());
  createEffect(() => {
    fn();
    if (!t || !t.fn) t = requestCallback(() => setDeferred(fn()), timeout !== undefined ? {
      timeout
    } : undefined);
  });
  return deferred;
}
function freeze(fn) {
  let pending = Pending,
      q = Pending = [];
  const result = fn();
  Pending = pending;
  runUpdates(() => {
    for (let i = 0; i < q.length; i += 1) {
      const data = q[i];
      if (data.pending !== NOTPENDING) {
        const pending = data.pending;
        data.pending = NOTPENDING;
        writeSignal.call(data, pending);
      }
    }
  });
  return result;
}
function sample(fn) {
  let result,
      listener = Listener;
  Listener = null;
  result = fn();
  Listener = listener;
  return result;
}
function afterEffects(fn) {
  Afters.push(fn);
}
function onCleanup(fn) {
  if (Owner === null) console.warn("cleanups created outside a `createRoot` or `render` will never be run");else if (Owner.cleanups === null) Owner.cleanups = [fn];else Owner.cleanups.push(fn);
  return fn;
}
function onError(fn) {
  if (Owner === null) console.warn("error handlers created outside a `createRoot` or `render` will never be run");else if (Owner.context === null) Owner.context = {
    [ERROR]: [fn]
  };else if (!Owner.context[ERROR]) Owner.context[ERROR] = [fn];else Owner.context[ERROR].push(fn);
}
function isListening() {
  return Listener !== null;
}
function createContext(defaultValue) {
  const id = Symbol("context");
  return {
    id,
    Provider: createProvider(id),
    defaultValue
  };
}
function useContext(context) {
  return lookup(Owner, context.id) || context.defaultValue;
}
function getContextOwner() {
  return Owner;
}
function readSignal() {
  if (this.state && this.sources) {
    const updates = Updates;
    Updates = null;
    this.state === STALE ? updateComputation(this) : lookDownstream(this);
    Updates = updates;
  }
  if (Listener) {
    const sSlot = this.observers ? this.observers.length : 0;
    if (!Listener.sources) {
      Listener.sources = [this];
      Listener.sourceSlots = [sSlot];
    } else {
      Listener.sources.push(this);
      Listener.sourceSlots.push(sSlot);
    }
    if (!this.observers) {
      this.observers = [Listener];
      this.observerSlots = [Listener.sources.length - 1];
    } else {
      this.observers.push(Listener);
      this.observerSlots.push(Listener.sources.length - 1);
    }
  }
  return this.value;
}
function writeSignal(value) {
  if (this.comparator && this.comparator(this.value, value)) return value;
  if (Pending) {
    if (this.pending === NOTPENDING) Pending.push(this);
    this.pending = value;
    return value;
  }
  this.value = value;
  if (this.observers && (!Updates || this.observers.length)) {
    runUpdates(() => {
      for (let i = 0; i < this.observers.length; i += 1) {
        const o = this.observers[i];
        if (o.observers && o.state !== PENDING) markUpstream(o);
        o.state = STALE;
        if (Updates.length > 10e5) throw new Error("Potential Infinite Loop Detected.");
        Updates.push(o);
      }
    });
  }
  return value;
}
function updateComputation(node) {
  if (!node.fn) return;
  cleanNode(node);
  const owner = Owner,
        listener = Listener,
        time = ExecCount;
  Listener = Owner = node;
  const nextValue = node.fn(node.value);
  if (!node.updatedAt || node.updatedAt <= time) {
    if (node.observers && node.observers.length) {
      writeSignal.call(node, nextValue);
    } else node.value = nextValue;
    node.updatedAt = time;
  }
  Listener = listener;
  Owner = owner;
}
function createComputation(fn, init) {
  const c = {
    fn,
    state: 0,
    updatedAt: null,
    owned: null,
    sources: null,
    sourceSlots: null,
    cleanups: null,
    value: init,
    owner: Owner,
    context: null
  };
  if (Owner === null) console.warn("computations created outside a `createRoot` or `render` will never be disposed");else if (Owner !== UNOWNED) {
    if (!Owner.owned) Owner.owned = [c];else Owner.owned.push(c);
  }
  return c;
}
function runTop(node) {
  let top = node.state === STALE && node;
  while (node.fn && (node = node.owner)) node.state === STALE && (top = node);
  top && updateComputation(top);
}
function runUpdates(fn) {
  if (Updates) return fn();
  Updates = [];
  ExecCount++;
  try {
    fn();
    for (let i = 0; i < Updates.length; i += 1) {
      try {
        runTop(Updates[i]);
      } catch (err) {
        const fns = lookup(Owner, ERROR);
        if (!fns) throw err;
        fns.forEach(f => f(err));
      }
    }
  } finally {
    Updates = null;
    while (Afters.length) Afters.shift()();
  }
}
function lookDownstream(node) {
  node.state = 0;
  for (let i = 0; i < node.sources.length; i += 1) {
    const source = node.sources[i];
    if (source.sources) {
      if (source.state === STALE) runTop(source);else if (source.state === PENDING) lookDownstream(source);
    }
  }
}
function markUpstream(node) {
  for (let i = 0; i < node.observers.length; i += 1) {
    const o = node.observers[i];
    if (!o.state) {
      o.state = PENDING;
      o.observers && markUpstream(o);
    }
  }
}
function cleanNode(node) {
  let i;
  if (node.sources) {
    while (node.sources.length) {
      const source = node.sources.pop(),
            index = node.sourceSlots.pop(),
            obs = source.observers;
      if (obs && obs.length) {
        const n = obs.pop(),
              s = source.observerSlots.pop();
        if (index < obs.length) {
          n.sourceSlots[s] = index;
          obs[index] = n;
          source.observerSlots[index] = s;
        }
      }
    }
    node.state = 0;
  }
  if (node.owned) {
    for (i = 0; i < node.owned.length; i++) cleanNode(node.owned[i]);
    node.owned = null;
  }
  if (node.cleanups) {
    for (i = 0; i < node.cleanups.length; i++) node.cleanups[i]();
    node.cleanups = null;
  }
}
function callAll(ss) {
  return () => {
    for (let i = 0; i < ss.length; i++) ss[i]();
  };
}
function lookup(owner, key) {
  return owner && (owner.context && owner.context[key] || owner.owner && lookup(owner.owner, key));
}
function resolveChildren(children) {
  if (typeof children === "function") return createMemo(() => resolveChildren(children()));
  if (Array.isArray(children)) {
    const results = [];
    for (let i = 0; i < children.length; i++) {
      let result = resolveChildren(children[i]);
      Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
    }
    return results;
  }
  return children;
}
function createProvider(id) {
  return function provider(props) {
    let rendered;
    createEffect(() => {
      Owner.context = {
        [id]: props.value
      };
      rendered = sample(() => resolveChildren(props.children));
    });
    return rendered;
  };
}

const $RAW = Symbol("state-raw"),
      $NODE = Symbol("state-node"),
      $PROXY = Symbol("state-proxy");
function wrap(value, traps) {
  return value[$PROXY] || (value[$PROXY] = new Proxy(value, traps || proxyTraps));
}
function isWrappable(obj) {
  return obj != null && typeof obj === "object" && (obj.__proto__ === Object.prototype || Array.isArray(obj));
}
function unwrap(item) {
  let result, unwrapped, v;
  if (result = item != null && item[$RAW]) return result;
  if (!isWrappable(item)) return item;
  if (Array.isArray(item)) {
    if (Object.isFrozen(item)) item = item.slice(0);
    for (let i = 0, l = item.length; i < l; i++) {
      v = item[i];
      if ((unwrapped = unwrap(v)) !== v) item[i] = unwrapped;
    }
  } else {
    if (Object.isFrozen(item)) item = Object.assign({}, item);
    let keys = Object.keys(item);
    for (let i = 0, l = keys.length; i < l; i++) {
      v = item[keys[i]];
      if ((unwrapped = unwrap(v)) !== v) item[keys[i]] = unwrapped;
    }
  }
  return item;
}
function getDataNodes(target) {
  let nodes = target[$NODE];
  if (!nodes) target[$NODE] = nodes = {};
  return nodes;
}
const proxyTraps = {
  get(target, property) {
    if (property === $RAW) return target;
    if (property === $PROXY || property === $NODE) return;
    const value = target[property],
          wrappable = isWrappable(value);
    if (isListening() && (typeof value !== "function" || target.hasOwnProperty(property))) {
      let nodes, node;
      if (wrappable && (nodes = getDataNodes(value))) {
        node = nodes._ || (nodes._ = createSignal());
        node[0]();
      }
      nodes = getDataNodes(target);
      node = nodes[property] || (nodes[property] = createSignal());
      node[0]();
    }
    return wrappable ? wrap(value) : value;
  },
  set() {
    return true;
  },
  deleteProperty() {
    return true;
  }
};
const setterTraps = {
  get(target, property) {
    if (property === $RAW) return target;
    const value = target[property];
    return isWrappable(value) ? new Proxy(value, setterTraps) : value;
  },
  set(target, property, value) {
    setProperty(target, property, unwrap(value));
    return true;
  },
  deleteProperty(target, property) {
    setProperty(target, property, undefined);
    return true;
  }
};
function setProperty(state, property, value, force) {
  if (!force && state[property] === value) return;
  const notify = Array.isArray(state) || !(property in state);
  if (value === undefined) {
    delete state[property];
  } else state[property] = value;
  let nodes = getDataNodes(state),
      node;
  (node = nodes[property]) && node[1]();
  notify && (node = nodes._) && node[1]();
}
function mergeState(state, value, force) {
  const keys = Object.keys(value);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    setProperty(state, key, value[key], force);
  }
}
function updatePath(current, path, traversed = []) {
  let part,
      next = current;
  if (path.length > 1) {
    part = path.shift();
    const partType = typeof part,
          isArray = Array.isArray(current);
    if (Array.isArray(part)) {
      for (let i = 0; i < part.length; i++) {
        updatePath(current, [part[i]].concat(path), [part[i]].concat(traversed));
      }
      return;
    } else if (isArray && partType === "function") {
      for (let i = 0; i < current.length; i++) {
        if (part(current[i], i)) updatePath(current, [i].concat(path), [i].concat(traversed));
      }
      return;
    } else if (isArray && partType === "object") {
      const {
        from = 0,
        to = current.length - 1,
        by = 1
      } = part;
      for (let i = from; i <= to; i += by) {
        updatePath(current, [i].concat(path), [i].concat(traversed));
      }
      return;
    } else if (path.length > 1) {
      updatePath(current[part], path, [part].concat(traversed));
      return;
    }
    next = current[part];
    traversed = [part].concat(traversed);
  }
  let value = path[0];
  if (typeof value === "function") {
    const wrapped = part === undefined || isWrappable(next) ? new Proxy(next, setterTraps) : next;
    value = value(wrapped, traversed);
    if (value === wrapped || value === undefined) return;
  }
  value = unwrap(value);
  if (part === undefined || isWrappable(next) && isWrappable(value) && !Array.isArray(value)) {
    mergeState(next, value);
  } else setProperty(current, part, value);
}
function createState(state) {
  const unwrappedState = unwrap(state || {});
  const wrappedState = wrap(unwrappedState);
  function setState(...args) {
    freeze(() => updatePath(unwrappedState, args));
  }
  return [wrappedState, setState];
}

function applyState(target, parent, property, merge, key) {
  let previous = parent[property];
  if (target === previous) return;
  if (!isWrappable(target) || !isWrappable(previous) || key && target[key] !== previous[key]) {
    target !== previous && setProperty(parent, property, target);
    return;
  }
  if (Array.isArray(target)) {
    if (target.length && previous.length && (!merge || key && target[0][key] != null)) {
      let i, j, start, end, newEnd, item, newIndicesNext, keyVal;
      for (start = 0, end = Math.min(previous.length, target.length); start < end && (previous[start] === target[start] || key && previous[start][key] === target[start][key]); start++) {
        applyState(target[start], previous, start, merge, key);
      }
      const temp = new Array(target.length),
            newIndices = new Map();
      for (end = previous.length - 1, newEnd = target.length - 1; end >= start && newEnd >= start && (previous[end] === target[newEnd] || key && previous[end][key] === target[newEnd][key]); end--, newEnd--) {
        temp[newEnd] = previous[end];
      }
      if (start > newEnd || start > end) {
        for (j = start; j <= newEnd; j++) setProperty(previous, j, target[j]);
        for (; j < target.length; j++) {
          setProperty(previous, j, temp[j]);
          applyState(target[j], previous, j, merge, key);
        }
        if (previous.length > target.length) setProperty(previous, "length", target.length);
        return;
      }
      newIndicesNext = new Array(newEnd + 1);
      for (j = newEnd; j >= start; j--) {
        item = target[j];
        keyVal = key ? item[key] : item;
        i = newIndices.get(keyVal);
        newIndicesNext[j] = i === undefined ? -1 : i;
        newIndices.set(keyVal, j);
      }
      for (i = start; i <= end; i++) {
        item = previous[i];
        keyVal = key ? item[key] : item;
        j = newIndices.get(keyVal);
        if (j !== undefined && j !== -1) {
          temp[j] = previous[i];
          j = newIndicesNext[j];
          newIndices.set(keyVal, j);
        }
      }
      for (j = start; j < target.length; j++) {
        if (j in temp) {
          setProperty(previous, j, temp[j]);
          applyState(target[j], previous, j, merge, key);
        } else setProperty(previous, j, target[j]);
      }
    } else {
      for (let i = 0, len = target.length; i < len; i++) {
        applyState(target[i], previous, i, merge, key);
      }
    }
    if (previous.length > target.length) setProperty(previous, "length", target.length);
    return;
  }
  const targetKeys = Object.keys(target);
  for (let i = 0, len = targetKeys.length; i < len; i++) {
    applyState(target[targetKeys[i]], previous, targetKeys[i], merge, key);
  }
  const previousKeys = Object.keys(previous);
  for (let i = 0, len = previousKeys.length; i < len; i++) {
    if (target[previousKeys[i]] === undefined) setProperty(previous, previousKeys[i], undefined);
  }
}
function reconcile(value, options = {}) {
  const {
    merge,
    key = "id"
  } = options;
  return state => {
    state = unwrap(state);
    if (!isWrappable(state)) return value;
    applyState(value, {
      state
    }, "state", merge, key);
  };
}

const FALLBACK = Symbol("fallback");
function mapArray(list, mapFn, options) {
  if (typeof mapFn !== "function") {
    options = mapFn || {};
    mapFn = list;
    return map;
  }
  options || (options = {});
  return map(list);
  function map(list) {
    let items = [],
        mapped = [],
        disposers = [],
        len = 0,
        indexes = mapFn.length > 1 ? [] : null;
    onCleanup(() => {
      for (let i = 0, length = disposers.length; i < length; i++) disposers[i]();
    });
    return () => {
      let newItems = list() || [],
          i,
          j;
      return sample(() => {
        let newLen = newItems.length,
            newIndices,
            newIndicesNext,
            temp,
            tempdisposers,
            tempIndexes,
            start,
            end,
            newEnd,
            item;
        if (newLen === 0) {
          if (len !== 0) {
            for (i = 0; i < len; i++) disposers[i]();
            disposers = [];
            items = [];
            mapped = [];
            len = 0;
            indexes && (indexes = []);
          }
          if (options.fallback) {
            items = [FALLBACK];
            mapped[0] = createRoot(disposer => {
              disposers[0] = disposer;
              return options.fallback();
            });
            len = 1;
          }
        }
        else if (len === 0) {
            for (j = 0; j < newLen; j++) {
              items[j] = newItems[j];
              mapped[j] = createRoot(mapper);
            }
            len = newLen;
          } else {
            temp = new Array(newLen);
            tempdisposers = new Array(newLen);
            indexes && (tempIndexes = new Array(newLen));
            for (start = 0, end = Math.min(len, newLen); start < end && items[start] === newItems[start]; start++);
            for (end = len - 1, newEnd = newLen - 1; end >= start && newEnd >= start && items[end] === newItems[newEnd]; end--, newEnd--) {
              temp[newEnd] = mapped[end];
              tempdisposers[newEnd] = disposers[end];
              indexes && (tempIndexes[newEnd] = indexes[end]);
            }
            if (start > newEnd) {
              for (j = end; start <= j; j--) disposers[j]();
              const rLen = end - start + 1;
              if (rLen > 0) {
                mapped.splice(start, rLen);
                disposers.splice(start, rLen);
                if (indexes) {
                  indexes.splice(start, rLen);
                  for (j = start; j < newLen; j++) indexes[j](j);
                }
              }
              items = newItems.slice(0);
              len = newLen;
              return mapped;
            }
            if (start > end) {
              for (j = start; j <= newEnd; j++) mapped[j] = createRoot(mapper);
              for (; j < newLen; j++) {
                mapped[j] = temp[j];
                disposers[j] = tempdisposers[j];
                if (indexes) {
                  indexes[j] = tempIndexes[j];
                  indexes[j](j);
                }
              }
              items = newItems.slice(0);
              len = newLen;
              return mapped;
            }
            newIndices = new Map();
            newIndicesNext = new Array(newEnd + 1);
            for (j = newEnd; j >= start; j--) {
              item = newItems[j];
              i = newIndices.get(item);
              newIndicesNext[j] = i === undefined ? -1 : i;
              newIndices.set(item, j);
            }
            for (i = start; i <= end; i++) {
              item = items[i];
              j = newIndices.get(item);
              if (j !== undefined && j !== -1) {
                temp[j] = mapped[i];
                tempdisposers[j] = disposers[i];
                indexes && (tempIndexes[j] = indexes[i]);
                j = newIndicesNext[j];
                newIndices.set(item, j);
              } else disposers[i]();
            }
            for (j = start; j < newLen; j++) {
              if (j in temp) {
                mapped[j] = temp[j];
                disposers[j] = tempdisposers[j];
                if (indexes) {
                  indexes[j] = tempIndexes[j];
                  indexes[j](j);
                }
              } else mapped[j] = createRoot(mapper);
            }
            len = mapped.length = newLen;
            items = newItems.slice(0);
          }
        return mapped;
      });
      function mapper(disposer) {
        disposers[j] = disposer;
        if (indexes) {
          const [s, set] = createSignal(j, true);
          indexes[j] = set;
          return mapFn(newItems[j], s);
        }
        return mapFn(newItems[j]);
      }
    };
  }
}
function indexArray(list, mapFn, options) {
  if (typeof mapFn !== "function") {
    options = mapFn || {};
    mapFn = list;
    return map;
  }
  options || (options = {});
  return map(list);
  function map(list) {
    let items = [],
        mapped = [],
        disposers = [],
        signals = [],
        len = 0,
        i;
    onCleanup(() => {
      for (let i = 0, length = disposers.length; i < length; i++) disposers[i]();
    });
    return () => {
      const newItems = list() || [];
      return sample(() => {
        if (newItems.length === 0) {
          if (len !== 0) {
            for (i = 0; i < len; i++) disposers[i]();
            disposers = [];
            items = [];
            mapped = [];
            len = 0;
            signals = [];
          }
          if (options.fallback) {
            items = [FALLBACK];
            mapped[0] = createRoot(disposer => {
              disposers[0] = disposer;
              return options.fallback();
            });
            len = 1;
          }
          return mapped;
        }
        if (items[0] === FALLBACK) {
          disposers[0]();
          disposers = [];
          items = [];
          mapped = [];
          len = 0;
        }
        for (i = 0; i < newItems.length; i++) {
          if (i < items.length && items[i] !== newItems[i]) {
            signals[i](newItems[i]);
          } else if (i >= items.length) {
            mapped[i] = createRoot(mapper);
          }
        }
        for (; i < items.length; i++) {
          disposers[i]();
        }
        len = mapped.length = signals.length = disposers.length = newItems.length;
        items = newItems.slice(0);
        return mapped;
      });
      function mapper(disposer) {
        disposers[i] = disposer;
        const [s, set] = createSignal(newItems[i]);
        signals[i] = set;
        return mapFn(s, i);
      }
    };
  }
}

function dynamicProperty(props, key) {
  const src = props[key];
  Object.defineProperty(props, key, {
    get() {
      return src();
    },
    enumerable: true
  });
}
function createComponent(Comp, props, dynamicKeys) {
  if (dynamicKeys) {
    for (let i = 0; i < dynamicKeys.length; i++) dynamicProperty(props, dynamicKeys[i]);
  }
  const c = sample(() => Comp(props));
  return typeof c === "function" ? createMemo(c) : c;
}
function setDefaults(props, defaultProps) {
  const propKeys = Object.keys(defaultProps);
  for (let i = 0; i < propKeys.length; i++) {
    const key = propKeys[i];
    !(key in props) && (props[key] = defaultProps[key]);
  }
}
function cloneProps(props) {
  const clone = {},
        descriptors = Object.getOwnPropertyDescriptors(props);
  Object.defineProperties(clone, descriptors);
  return clone;
}
function splitProps(props, ...keys) {
  const descriptors = Object.getOwnPropertyDescriptors(props),
        split = k => {
    const clone = {};
    for (let i = 0; i < k.length; i++) {
      const key = k[i];
      if (descriptors[key]) {
        Object.defineProperty(clone, key, descriptors[key]);
        delete descriptors[key];
      }
    }
    return clone;
  };
  return keys.map(split).concat(split(Object.keys(descriptors)));
}

function createActivityTracker() {
  let count = 0;
  const [read, trigger] = createSignal(false);
  return [read, () => count++ === 0 && trigger(true), () => --count <= 0 && trigger(false)];
}
const SuspenseContext = createContext({});
const [active, increment, decrement] = createActivityTracker();
SuspenseContext.active = active;
SuspenseContext.increment = increment;
SuspenseContext.decrement = decrement;
function awaitSuspense(fn) {
  return () => new Promise(resolve => {
    const res = fn();
    createEffect(() => !SuspenseContext.active() && resolve(res));
  });
}
function createResource(value) {
  const [s, set] = createSignal(value),
        [trackPromise, triggerPromise] = createSignal(),
        [trackLoading, triggerLoading] = createSignal(),
        contexts = new Set();
  let loading = false,
      error = null,
      pr;
  function loadEnd(v) {
    pr = undefined;
    freeze(() => {
      set(v);
      loading && (loading = false, triggerLoading());
      for (let c of contexts.keys()) c.decrement();
      contexts.clear();
    });
  }
  function read() {
    const c = useContext(SuspenseContext),
          v = s();
    if (error) throw error;
    trackPromise();
    if (pr && c.increment && !contexts.has(c)) {
      c.increment();
      contexts.add(c);
    }
    return v;
  }
  function load(p) {
    error = null;
    if (p == null || typeof p !== "object" || !("then" in p)) {
      pr = undefined;
      loadEnd(p);
      return p;
    } else {
      pr = p;
      if (!loading) {
        loading = true;
        freeze(() => {
          triggerLoading();
          triggerPromise();
        });
      }
      return p.then(v => (pr === p && loadEnd(v), s()), err => (pr === p && (error = err, loadEnd(undefined)), s()));
    }
  }
  Object.defineProperty(read, "loading", {
    get() {
      return trackLoading(), loading;
    }
  });
  return [read, load];
}
function createResourceNode(v) {
  const node = createSignal(),
        [r, load] = createResource(v);
  return [() => (r(), node[0]()), node[1], load, () => r.loading];
}
const loadingTraps = {
  get(nodes, property) {
    const node = nodes[property] || (nodes[property] = createResourceNode(undefined));
    return node[3]();
  },
  set() {
    return true;
  },
  deleteProperty() {
    return true;
  }
};
const resourceTraps = {
  get(target, property) {
    if (property === $RAW) return target;
    if (property === $PROXY || property === $NODE) return;
    if (property === "loading") return new Proxy(getDataNodes(target), loadingTraps);
    const value = target[property],
          wrappable = isWrappable(value);
    if (isListening() && (typeof value !== "function" || target.hasOwnProperty(property))) {
      let nodes, node;
      if (wrappable && (nodes = getDataNodes(value))) {
        node = nodes._ || (nodes._ = createSignal());
        node[0]();
      }
      nodes = getDataNodes(target);
      node = nodes[property] || (nodes[property] = createResourceNode(value));
      node[0]();
    }
    return wrappable ? wrap(value) : value;
  },
  set() {
    return true;
  },
  deleteProperty() {
    return true;
  }
};
function createResourceState(state) {
  const unwrappedState = unwrap(state || {}),
        wrappedState = wrap(unwrappedState, resourceTraps);
  function setState(...args) {
    freeze(() => updatePath(unwrappedState, args));
  }
  function loadState(v, r) {
    const nodes = getDataNodes(unwrappedState),
          keys = Object.keys(v);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i],
            node = nodes[k] || (nodes[k] = createResourceNode(unwrappedState[k])),
            resolver = v => (r ? setState(k, r(v)) : setProperty(unwrappedState, k, v), v),
            p = node[2](v[k]);
      typeof p === "object" && "then" in p ? p.then(resolver) : resolver(p);
    }
  }
  return [wrappedState, loadState, setState];
}
function lazy(fn) {
  return props => {
    const hydrating = globalThis._$HYDRATION.context && globalThis._$HYDRATION.context.registry,
          ctx = nextHydrateContext(),
          [s, p] = createResource();
    if (hydrating) {
      fn().then(mod => p(mod.default));
    } else p(fn().then(mod => mod.default));
    let Comp;
    return () => (Comp = s()) && sample(() => {
      if (!ctx) return Comp(props);
      const h = globalThis._$HYDRATION.context;
      setHydrateContext(ctx);
      const r = Comp(props);
      !h && setHydrateContext();
      return r;
    });
  };
}
function useTransition(config) {
  const [pending, increment, decrement] = createActivityTracker();
  return [pending, fn => {
    const prevTransition = SuspenseContext.transition;
    SuspenseContext.transition = {
      timeoutMs: config.timeoutMs,
      increment,
      decrement
    };
    increment();
    fn();
    decrement();
    afterEffects(() => SuspenseContext.transition = prevTransition);
  }];
}
function suspend(fn) {
  const {
    state
  } = useContext(SuspenseContext);
  let cached;
  return state ? (fn = createMemo(fn), () => state() === "suspended" ? cached : cached = fn()) : fn;
}
function setHydrateContext(context) {
  globalThis._$HYDRATION.context = context;
}
function nextHydrateContext() {
  const hydration = globalThis._$HYDRATION;
  return hydration && hydration.context ? {
    id: `${hydration.context.id}.${hydration.context.count++}`,
    count: 0,
    registry: hydration.context.registry
  } : undefined;
}

function For(props) {
  const fallback = "fallback" in props && {
    fallback: () => props.fallback
  };
  return suspend(mapArray(() => props.each, props.children, fallback ? fallback : undefined));
}
function Index(props) {
  const fallback = "fallback" in props && {
    fallback: () => props.fallback
  };
  return suspend(indexArray(() => props.each, props.children, fallback ? fallback : undefined));
}
function Show(props) {
  const childDesc = Object.getOwnPropertyDescriptor(props, "children").value,
        callFn = typeof childDesc === "function" && childDesc.length,
        condition = createMemo(callFn ? () => props.when : () => !!props.when, undefined, true);
  return suspend(() => {
    const c = condition();
    return c ? callFn ? sample(() => props.children(c)) : props.children : props.fallback;
  });
}
function Switch(props) {
  let conditions = props.children;
  Array.isArray(conditions) || (conditions = [conditions]);
  const evalConditions = createMemo(() => {
    for (let i = 0; i < conditions.length; i++) {
      const c = conditions[i].when;
      if (c) return [i, conditions[i].keyed ? c : !!c];
    }
    return [-1];
  }, undefined, (a, b) => a && a[0] === b[0] && a[1] === b[1]);
  return suspend(() => {
    const [index, when] = evalConditions();
    if (index < 0) return props.fallback;
    const c = conditions[index].children;
    return typeof c === "function" && c.length ? sample(() => c(when)) : c;
  });
}
function Match(props) {
  const childDesc = Object.getOwnPropertyDescriptor(props, "children").value;
  props.keyed = typeof childDesc === "function" && childDesc.length;
  return props;
}
function Dynamic(props) {
  const [p, others] = splitProps(props, ["component"]);
  return () => {
    const comp = p.component;
    return comp && sample(() => comp(others));
  };
}

const SuspenseListContext = createContext();
function SuspenseList(props) {
  let index = 0,
      suspenseSetter,
      showContent,
      showFallback;
  const listContext = useContext(SuspenseListContext);
  if (listContext) {
    const [state, stateSetter] = createSignal("running", true);
    suspenseSetter = stateSetter;
    [showContent, showFallback] = listContext.register(state);
  }
  const registry = [],
        comp = createComponent(SuspenseListContext.Provider, {
    value: {
      register: state => {
        const [showingContent, showContent] = createSignal(false, true),
              [showingFallback, showFallback] = createSignal(false, true);
        registry[index++] = {
          state,
          showContent,
          showFallback
        };
        return [showingContent, showingFallback];
      }
    },
    children: () => props.children
  }, ["children"]);
  createEffect(() => {
    const reveal = props.revealOrder,
          tail = props.tail,
          visibleContent = showContent ? showContent() : true,
          visibleFallback = showFallback ? showFallback() : true,
          reverse = reveal === "backwards";
    if (reveal === "together") {
      const all = registry.every(i => i.state() === "running");
      suspenseSetter && suspenseSetter(all ? "running" : "fallback");
      registry.forEach(i => {
        i.showContent(all && visibleContent);
        i.showFallback(visibleFallback);
      });
      return;
    }
    let stop = false;
    for (let i = 0, len = registry.length; i < len; i++) {
      const n = reverse ? len - i - 1 : i,
            s = registry[n].state();
      if (!stop && (s === "running" || s === "suspended")) {
        registry[n].showContent(visibleContent);
        registry[n].showFallback(visibleFallback);
      } else {
        const next = !stop;
        if (next && suspenseSetter) suspenseSetter("fallback");
        if (!tail || next && tail === "collapsed") {
          registry[n].showFallback(visibleFallback);
        } else registry[n].showFallback(false);
        stop = true;
        registry[n].showContent(next);
      }
    }
    if (!stop && suspenseSetter) suspenseSetter("running");
  });
  return comp;
}
function Suspense(props) {
  let counter = 0,
      t,
      showContent,
      showFallback,
      transition;
  const [state, nextState] = createSignal("running", true),
        store = {
    increment: () => {
      if (++counter === 1) {
        if (!store.initializing) {
          if (SuspenseContext.transition) {
            !transition && (transition = SuspenseContext.transition).increment();
            t = setTimeout(() => nextState("fallback"), SuspenseContext.transition.timeoutMs);
            nextState("suspended");
          } else nextState("fallback");
        } else nextState("fallback");
        SuspenseContext.increment();
      }
    },
    decrement: () => {
      if (--counter === 0) {
        t && clearTimeout(t);
        transition && transition.decrement();
        transition = undefined;
        nextState("running");
        afterEffects(() => SuspenseContext.decrement());
      }
    },
    state,
    initializing: true
  };
  const listContext = useContext(SuspenseListContext);
  if (listContext) [showContent, showFallback] = listContext.register(store.state);
  return createComponent(SuspenseContext.Provider, {
    value: store,
    children: () => {
      const rendered = sample(() => props.children);
      return () => {
        const value = store.state(),
              visibleContent = showContent ? showContent() : true,
              visibleFallback = showFallback ? showFallback() : true;
        if (store.initializing) store.initializing = false;
        if (value === "running" && visibleContent || value === "suspended") return rendered;
        if (!visibleFallback) return;
        return props.fallback;
      };
    }
  }, ["children"]);
}



// CONCATENATED MODULE: ./node_modules/solid-js/dist/dom/index.js



const Types = {
  ATTRIBUTE: "attribute",
  PROPERTY: "property"
},
      Attributes = {
  href: {
    type: Types.ATTRIBUTE
  },
  style: {
    type: Types.PROPERTY,
    alias: "style.cssText"
  },
  for: {
    type: Types.PROPERTY,
    alias: "htmlFor"
  },
  class: {
    type: Types.PROPERTY,
    alias: "className"
  },
  spellCheck: {
    type: Types.PROPERTY,
    alias: "spellcheck"
  },
  allowFullScreen: {
    type: Types.PROPERTY,
    alias: "allowFullscreen"
  },
  autoCapitalize: {
    type: Types.PROPERTY,
    alias: "autocapitalize"
  },
  autoFocus: {
    type: Types.PROPERTY,
    alias: "autofocus"
  },
  autoPlay: {
    type: Types.PROPERTY,
    alias: "autoplay"
  }
},
      SVGAttributes = {
  className: {
    type: Types.ATTRIBUTE,
    alias: "class"
  },
  htmlFor: {
    type: Types.ATTRIBUTE,
    alias: "for"
  },
  tabIndex: {
    type: Types.ATTRIBUTE,
    alias: "tabindex"
  },
  allowReorder: {
    type: Types.ATTRIBUTE
  },
  attributeName: {
    type: Types.ATTRIBUTE
  },
  attributeType: {
    type: Types.ATTRIBUTE
  },
  autoReverse: {
    type: Types.ATTRIBUTE
  },
  baseFrequency: {
    type: Types.ATTRIBUTE
  },
  calcMode: {
    type: Types.ATTRIBUTE
  },
  clipPathUnits: {
    type: Types.ATTRIBUTE
  },
  contentScriptType: {
    type: Types.ATTRIBUTE
  },
  contentStyleType: {
    type: Types.ATTRIBUTE
  },
  diffuseConstant: {
    type: Types.ATTRIBUTE
  },
  edgeMode: {
    type: Types.ATTRIBUTE
  },
  externalResourcesRequired: {
    type: Types.ATTRIBUTE
  },
  filterRes: {
    type: Types.ATTRIBUTE
  },
  filterUnits: {
    type: Types.ATTRIBUTE
  },
  gradientTransform: {
    type: Types.ATTRIBUTE
  },
  gradientUnits: {
    type: Types.ATTRIBUTE
  },
  kernelMatrix: {
    type: Types.ATTRIBUTE
  },
  kernelUnitLength: {
    type: Types.ATTRIBUTE
  },
  keyPoints: {
    type: Types.ATTRIBUTE
  },
  keySplines: {
    type: Types.ATTRIBUTE
  },
  keyTimes: {
    type: Types.ATTRIBUTE
  },
  lengthAdjust: {
    type: Types.ATTRIBUTE
  },
  limitingConeAngle: {
    type: Types.ATTRIBUTE
  },
  markerHeight: {
    type: Types.ATTRIBUTE
  },
  markerUnits: {
    type: Types.ATTRIBUTE
  },
  maskContentUnits: {
    type: Types.ATTRIBUTE
  },
  maskUnits: {
    type: Types.ATTRIBUTE
  },
  numOctaves: {
    type: Types.ATTRIBUTE
  },
  pathLength: {
    type: Types.ATTRIBUTE
  },
  patternContentUnits: {
    type: Types.ATTRIBUTE
  },
  patternTransform: {
    type: Types.ATTRIBUTE
  },
  patternUnits: {
    type: Types.ATTRIBUTE
  },
  pointsAtX: {
    type: Types.ATTRIBUTE
  },
  pointsAtY: {
    type: Types.ATTRIBUTE
  },
  pointsAtZ: {
    type: Types.ATTRIBUTE
  },
  preserveAlpha: {
    type: Types.ATTRIBUTE
  },
  preserveAspectRatio: {
    type: Types.ATTRIBUTE
  },
  primitiveUnits: {
    type: Types.ATTRIBUTE
  },
  refX: {
    type: Types.ATTRIBUTE
  },
  refY: {
    type: Types.ATTRIBUTE
  },
  repeatCount: {
    type: Types.ATTRIBUTE
  },
  repeatDur: {
    type: Types.ATTRIBUTE
  },
  requiredExtensions: {
    type: Types.ATTRIBUTE
  },
  requiredFeatures: {
    type: Types.ATTRIBUTE
  },
  specularConstant: {
    type: Types.ATTRIBUTE
  },
  specularExponent: {
    type: Types.ATTRIBUTE
  },
  spreadMethod: {
    type: Types.ATTRIBUTE
  },
  startOffset: {
    type: Types.ATTRIBUTE
  },
  stdDeviation: {
    type: Types.ATTRIBUTE
  },
  stitchTiles: {
    type: Types.ATTRIBUTE
  },
  surfaceScale: {
    type: Types.ATTRIBUTE
  },
  systemLanguage: {
    type: Types.ATTRIBUTE
  },
  tableValues: {
    type: Types.ATTRIBUTE
  },
  targetX: {
    type: Types.ATTRIBUTE
  },
  targetY: {
    type: Types.ATTRIBUTE
  },
  textLength: {
    type: Types.ATTRIBUTE
  },
  viewBox: {
    type: Types.ATTRIBUTE
  },
  viewTarget: {
    type: Types.ATTRIBUTE
  },
  xChannelSelector: {
    type: Types.ATTRIBUTE
  },
  yChannelSelector: {
    type: Types.ATTRIBUTE
  },
  zoomAndPan: {
    type: Types.ATTRIBUTE
  }
};
const NonComposedEvents = new Set(["abort", "animationstart", "animationend", "animationiteration", "blur", "change", "copy", "cut", "error", "focus", "gotpointercapture", "load", "loadend", "loadstart", "lostpointercapture", "mouseenter", "mouseleave", "paste", "progress", "reset", "scroll", "select", "submit", "transitionstart", "transitioncancel", "transitionend", "transitionrun"]);

function memo(fn, equal) {
  return createMemo(fn, undefined, equal);
}

function reconcileArrays(parentNode, a, b) {
  let bLength = b.length,
      aEnd = a.length,
      bEnd = bLength,
      aStart = 0,
      bStart = 0,
      after = a[aEnd - 1].nextSibling,
      map = null;
  while (aStart < aEnd || bStart < bEnd) {
    if (aEnd === aStart) {
      const node = bEnd < bLength ? bStart ? b[bStart - 1].nextSibling : b[bEnd - bStart] : after;
      while (bStart < bEnd) parentNode.insertBefore(b[bStart++], node);
    } else if (bEnd === bStart) {
      while (aStart < aEnd) {
        if (!map || !map.has(a[aStart])) parentNode.removeChild(a[aStart]);
        aStart++;
      }
    } else if (a[aStart] === b[bStart]) {
      aStart++;
      bStart++;
    } else if (a[aEnd - 1] === b[bEnd - 1]) {
      aEnd--;
      bEnd--;
    } else if (aEnd - aStart === 1 && bEnd - bStart === 1) {
      if (map && map.has(a[aStart]) || a[aStart].parentNode !== parentNode) {
        parentNode.insertBefore(b[bStart], bEnd < bLength ? b[bEnd] : after);
      } else parentNode.replaceChild(b[bStart], a[aStart]);
      break;
    } else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
      const node = a[--aEnd].nextSibling;
      parentNode.insertBefore(b[bStart++], a[aStart++].nextSibling);
      parentNode.insertBefore(b[--bEnd], node);
      a[aEnd] = b[bEnd];
    } else {
      if (!map) {
        map = new Map();
        let i = bStart;
        while (i < bEnd) map.set(b[i], i++);
      }
      if (map.has(a[aStart])) {
        const index = map.get(a[aStart]);
        if (bStart < index && index < bEnd) {
          let i = aStart,
              sequence = 1;
          while (++i < aEnd && i < bEnd) {
            if (!map.has(a[i]) || map.get(a[i]) !== index + sequence) break;
            sequence++;
          }
          if (sequence > index - bStart) {
            const node = a[aStart];
            while (bStart < index) parentNode.insertBefore(b[bStart++], node);
          } else parentNode.replaceChild(b[bStart++], a[aStart++]);
        } else aStart++;
      } else parentNode.removeChild(a[aStart++]);
    }
  }
}

const eventRegistry = new Set(),
      hydration = globalThis._$HYDRATION || (globalThis._$HYDRATION = {});
function render(code, element) {
  let disposer;
  createRoot(dispose => {
    disposer = dispose;
    insert(element, code(), element.firstChild ? null : undefined);
  });
  return disposer;
}
function renderToString(code, options = {}) {
  options = {
    timeoutMs: 30000,
    ...options
  };
  hydration.context = {
    id: "0",
    count: 0
  };
  return createRoot(() => {
    const rendered = code();
    if (typeof rendered === "object" && "then" in rendered) {
      const timeout = new Promise((_, reject) => setTimeout(() => reject("renderToString timed out"), options.timeoutMs));
      return Promise.race([rendered, timeout]).then(resolveSSRNode);
    }
    return resolveSSRNode(rendered);
  });
}
function renderDOMToString(code, options = {}) {
  options = {
    timeoutMs: 30000,
    ...options
  };
  hydration.context = {
    id: "0",
    count: 0
  };
  const container = document.createElement("div");
  document.body.appendChild(container);
  return createRoot(d1 => {
    const rendered = code();
    function resolve(rendered) {
      createRoot(d2 => (insert(container, rendered), d1(), d2()));
      const html = container.innerHTML;
      document.body.removeChild(container);
      return html;
    }
    if (typeof rendered === "object" && "then" in rendered) {
      const timeout = new Promise((_, reject) => setTimeout(() => reject("renderToString timed out"), options.timeoutMs));
      return Promise.race([rendered, timeout]).then(resolve);
    }
    return resolve(rendered);
  });
}
function hydrate(code, element) {
  hydration.context = {
    id: "0",
    count: 0,
    registry: {}
  };
  const templates = element.querySelectorAll(`*[_hk]`);
  Array.prototype.reduce.call(templates, (memo, node) => {
    const id = node.getAttribute("_hk"),
          list = memo[id] || (memo[id] = []);
    list.push(node);
    return memo;
  }, hydration.context.registry);
  const dispose = render(code, element);
  delete hydration.context;
  return dispose;
}
function template(html, check, isSVG) {
  const t = document.createElement("template");
  t.innerHTML = html;
  if (check && t.innerHTML.split("<").length - 1 !== check) throw `Template html does not match input:\n${t.innerHTML}\n\n${html}`;
  let node = t.content.firstChild;
  if (isSVG) node = node.firstChild;
  return node;
}
function delegateEvents(eventNames) {
  for (let i = 0, l = eventNames.length; i < l; i++) {
    const name = eventNames[i];
    if (!eventRegistry.has(name)) {
      eventRegistry.add(name);
      document.addEventListener(name, eventHandler);
    }
  }
}
function clearDelegatedEvents() {
  for (let name of eventRegistry.keys()) document.removeEventListener(name, eventHandler);
  eventRegistry.clear();
}
function setAttribute(node, name, value) {
  if (value === false || value == null) node.removeAttribute(name);else node.setAttribute(name, value);
}
function setAttributeNS(node, namespace, name, value) {
  if (value === false || value == null) node.removeAttributeNS(namespace, name);else node.setAttributeNS(namespace, name, value);
}
function classList(node, value, prev) {
  const classKeys = Object.keys(value);
  for (let i = 0, len = classKeys.length; i < len; i++) {
    const key = classKeys[i],
          classValue = !!value[key],
          classNames = key.split(/\s+/);
    if (!key || prev && prev[key] === classValue) continue;
    for (let j = 0, nameLen = classNames.length; j < nameLen; j++) node.classList.toggle(classNames[j], classValue);
  }
  return value;
}
function style(node, value, prev) {
  const nodeStyle = node.style;
  if (typeof value === "string") return nodeStyle.cssText = value;
  let v, s;
  if (prev != null && typeof prev !== "string") {
    for (s in value) {
      v = value[s];
      v !== prev[s] && nodeStyle.setProperty(s, v);
    }
    for (s in prev) {
      value[s] == null && nodeStyle.removeProperty(s);
    }
  } else {
    for (s in value) nodeStyle.setProperty(s, value[s]);
  }
  return value;
}
function spread(node, accessor, isSVG, skipChildren) {
  if (typeof accessor === "function") {
    createEffect(current => spreadExpression(node, accessor(), current, isSVG, skipChildren));
  } else spreadExpression(node, accessor, undefined, isSVG, skipChildren);
}
function insert(parent, accessor, marker, initial) {
  if (marker !== undefined && !initial) initial = [];
  if (typeof accessor !== "function") return insertExpression(parent, accessor, initial, marker);
  createEffect(current => insertExpression(parent, accessor(), current, marker), initial);
}
function dom_assign(node, props, isSVG, skipChildren, prevProps = {}) {
  let info;
  for (const prop in props) {
    if (prop === "children") {
      if (!skipChildren) insertExpression(node, props.children);
      continue;
    }
    const value = props[prop];
    if (value === prevProps[prop]) continue;
    if (prop === "style") {
      style(node, value, prevProps[prop]);
    } else if (prop === "classList") {
      classList(node, value, prevProps[prop]);
    } else if (prop === "ref") {
      value(node);
    } else if (prop === "on") {
      for (const eventName in value) node.addEventListener(eventName, value[eventName]);
    } else if (prop === "onCapture") {
      for (const eventName in value) node.addEventListener(eventName, value[eventName], true);
    } else if (prop.slice(0, 2) === "on") {
      const lc = prop.toLowerCase();
      if (!NonComposedEvents.has(lc.slice(2))) {
        const name = lc.slice(2);
        if (Array.isArray(value)) {
          node[`__${name}`] = value[0];
          node[`__${name}Data`] = value[1];
        } else node[`__${name}`] = value;
        delegateEvents([name]);
      } else node[lc] = value;
    } else if (info = Attributes[prop]) {
      if (info.type === "attribute") {
        setAttribute(node, prop, value);
      } else node[info.alias] = value;
    } else if (isSVG || prop.indexOf("-") > -1 || prop.indexOf(":") > -1) {
      const ns = prop.indexOf(":") > -1 && SVGNamepace[prop.split(":")[0]];
      if (ns) setAttributeNS(node, ns, prop, value);else if (info = SVGAttributes[prop]) {
        if (info.alias) setAttribute(node, info.alias, value);else setAttribute(node, prop, value);
      } else setAttribute(node, prop.replace(/([A-Z])/g, g => `-${g[0].toLowerCase()}`), value);
    } else node[prop] = value;
    prevProps[prop] = value;
  }
}
function ssr(t, ...nodes) {
  if (!nodes.length) return {
    t
  };
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (typeof n === "function") nodes[i] = memo(() => resolveSSRNode(n()));
  }
  return {
    t: () => {
      let result = "";
      for (let i = 0; i < t.length; i++) {
        result += t[i];
        const node = nodes[i];
        if (node !== undefined) result += resolveSSRNode(node);
      }
      return result;
    }
  };
}
function ssrClassList(value) {
  let classKeys = Object.keys(value),
      result = "";
  for (let i = 0, len = classKeys.length; i < len; i++) {
    const key = classKeys[i],
          classValue = !!value[key];
    if (!key || !classValue) continue;
    i && (result += " ");
    result += key;
  }
  return result;
}
function ssrStyle(value) {
  if (typeof value === "string") return value;
  let result = "";
  const k = Object.keys(value);
  for (let i = 0; i < k.length; i++) {
    const s = k[i];
    if (i) result += ";";
    result += `${s}:${dom_escape(value[s], true)}`;
  }
  return result;
}
function ssrSpread(props, isSVG) {
  return () => {
    if (typeof props === "function") props = props();
    const keys = Object.keys(props);
    let result = "";
    for (let i = 0; i < keys.length; i++) {
      const prop = keys[i];
      if (prop === "children") {
        console.warn(`SSR currently does not support spread children.`);
        continue;
      }
      const value = props[prop];
      if (prop === "style") {
        result += `style="${ssrStyle(value)}"`;
      } else if (prop === "classList") {
        result += `class="${ssrClassList(value)}"`;
      } else {
        const key = toSSRAttribute(prop, isSVG);
        result += `${key}="${dom_escape(value, true)}"`;
      }
      if (i !== keys.length - 1) result += " ";
    }
    return result;
  };
}
const ATTR_REGEX = /[&<"]/g,
      CONTENT_REGEX = /[&<]/g;
function dom_escape(html, attr) {
  if (typeof html !== "string") return html;
  return html.replace(attr ? ATTR_REGEX : CONTENT_REGEX, m => {
    switch (m) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case '"':
        return "&quot;";
    }
  });
}
function getNextElement(template, isSSR) {
  const hydrate = hydration.context;
  let node, key;
  if (!hydrate || !hydrate.registry || !((key = getHydrationKey()) && hydrate.registry[key] && (node = hydrate.registry[key].shift()))) {
    const el = template.cloneNode(true);
    if (isSSR && hydrate) el.setAttribute("_hk", getHydrationKey());
    return el;
  }
  if (hydration && hydration.completed) hydration.completed.add(node);
  return node;
}
function getNextMarker(start) {
  let end = start,
      count = 0,
      current = [];
  if (hydration.context && hydration.context.registry) {
    while (end) {
      if (end.nodeType === 8) {
        const v = end.nodeValue;
        if (v === "#") count++;else if (v === "/") {
          if (count === 0) return [end, current];
          count--;
        }
      }
      current.push(end);
      end = end.nextSibling;
    }
  }
  return [end, current];
}
function runHydrationEvents(el) {
  if (hydration && hydration.events) {
    const {
      completed,
      events
    } = hydration;
    while (events.length) {
      const [el, e] = events[0];
      if (!completed.has(el)) return;
      eventHandler(e);
      events.shift();
    }
  }
}
function getHydrationKey() {
  return hydration.context.id;
}
function generateHydrationEventsScript(eventNames) {
  return `(()=>{_$HYDRATION={events:[],completed:new WeakSet};const t=e=>e&&e.hasAttribute&&(e.hasAttribute("_hk")&&e||t(e.host&&e.host instanceof Node?e.host:e.parentNode)),e=e=>{let o=e.composedPath&&e.composedPath()[0]||e.target,s=t(o);s&&!_$HYDRATION.completed.has(s)&&_$HYDRATION.events.push([s,e])};["${eventNames.join('","')}"].forEach(t=>document.addEventListener(t,e))})();`;
}
function eventHandler(e) {
  const key = `__${e.type}`;
  let node = e.composedPath && e.composedPath()[0] || e.target;
  if (e.target !== node) {
    Object.defineProperty(e, "target", {
      configurable: true,
      value: node
    });
  }
  Object.defineProperty(e, "currentTarget", {
    configurable: true,
    get() {
      return node;
    }
  });
  while (node !== null) {
    const handler = node[key];
    if (handler) {
      const data = node[`${key}Data`];
      data ? handler(data, e) : handler(e);
      if (e.cancelBubble) return;
    }
    node = node.host && node.host instanceof Node ? node.host : node.parentNode;
  }
}
function spreadExpression(node, props, prevProps = {}, isSVG, skipChildren) {
  if (!skipChildren && "children" in props) {
    createEffect(() => prevProps.children = insertExpression(node, props.children, prevProps.children));
  }
  createEffect(() => dom_assign(node, props, isSVG, true, prevProps));
  return prevProps;
}
function insertExpression(parent, value, current, marker, unwrapArray) {
  while (typeof current === "function") current = current();
  if (value === current) return current;
  const t = typeof value,
        multi = marker !== undefined;
  parent = multi && current[0] && current[0].parentNode || parent;
  if (t === "string" || t === "number") {
    if (t === "number") value = value.toString();
    if (multi) {
      let node = current[0];
      if (node && node.nodeType === 3) {
        node.data = value;
      } else node = document.createTextNode(value);
      current = cleanChildren(parent, current, marker, node);
    } else {
      if (current !== "" && typeof current === "string") {
        current = parent.firstChild.data = value;
      } else current = parent.textContent = value;
    }
  } else if (value == null || t === "boolean") {
    if (hydration.context && hydration.context.registry) return current;
    current = cleanChildren(parent, current, marker);
  } else if (t === "function") {
    createEffect(() => current = insertExpression(parent, value(), current, marker));
    return () => current;
  } else if (Array.isArray(value)) {
    const array = [];
    if (normalizeIncomingArray(array, value, unwrapArray)) {
      createEffect(() => current = insertExpression(parent, array, current, marker, true));
      return () => current;
    }
    if (hydration.context && hydration.context.registry) return array;
    if (array.length === 0) {
      current = cleanChildren(parent, current, marker);
      if (multi) return current;
    } else {
      if (Array.isArray(current)) {
        if (current.length === 0) {
          appendNodes(parent, array, marker);
        } else reconcileArrays(parent, current, array);
      } else if (current == null || current === "") {
        appendNodes(parent, array);
      } else {
        reconcileArrays(parent, multi && current || [parent.firstChild], array);
      }
    }
    current = array;
  } else if (value instanceof Node) {
    if (Array.isArray(current)) {
      if (multi) return current = cleanChildren(parent, current, marker, value);
      cleanChildren(parent, current, null, value);
    } else if (current == null || current === "" || !parent.firstChild) {
      parent.appendChild(value);
    } else parent.replaceChild(value, parent.firstChild);
    current = value;
  } else console.warn(`Skipped inserting`, value);
  return current;
}
function normalizeIncomingArray(normalized, array, unwrap) {
  let dynamic = false;
  for (let i = 0, len = array.length; i < len; i++) {
    let item = array[i],
        t;
    if (item instanceof Node) {
      normalized.push(item);
    } else if (item == null || item === true || item === false) ; else if (Array.isArray(item)) {
      dynamic = normalizeIncomingArray(normalized, item) || dynamic;
    } else if ((t = typeof item) === "string") {
      normalized.push(document.createTextNode(item));
    } else if (t === "function") {
      if (unwrap) {
        const idx = item();
        dynamic = normalizeIncomingArray(normalized, Array.isArray(idx) ? idx : [idx]) || dynamic;
      } else {
        normalized.push(item);
        dynamic = true;
      }
    } else normalized.push(document.createTextNode(item.toString()));
  }
  return dynamic;
}
function appendNodes(parent, array, marker) {
  for (let i = 0, len = array.length; i < len; i++) parent.insertBefore(array[i], marker);
}
function cleanChildren(parent, current, marker, replacement) {
  if (marker === undefined) return parent.textContent = "";
  const node = replacement || document.createTextNode("");
  if (current.length) {
    let inserted = false;
    for (let i = current.length - 1; i >= 0; i--) {
      const el = current[i];
      if (node !== el) {
        const isParent = el.parentNode === parent;
        if (!inserted && !i) isParent ? parent.replaceChild(node, el) : parent.insertBefore(node, marker);else isParent && parent.removeChild(el);
      } else inserted = true;
    }
  } else parent.insertBefore(node, marker);
  return [node];
}
function toSSRAttribute(key, isSVG) {
  if (isSVG) {
    const attr = SVGAttributes[key];
    if (attr) {
      if (attr.alias) key = attr.alias;
    } else key = key.replace(/([A-Z])/g, g => `-${g[0].toLowerCase()}`);
  } else {
    const attr = SVGAttributes[key];
    if (attr && attr.alias) key = attr.alias;
    key = key.toLowerCase();
  }
  return key;
}
function resolveSSRNode(node) {
  if (Array.isArray(node)) return node.map(resolveSSRNode).join("");
  const t = typeof node;
  if (node && t === "object") return resolveSSRNode(node.t);
  if (t === "function") return resolveSSRNode(node());
  return t === "string" ? node : JSON.stringify(node);
}

function Portal(props) {
  const {
    useShadow
  } = props,
        container = document.createElement("div"),
        marker = document.createTextNode(""),
        mount = props.mount || document.body,
        renderRoot = useShadow && container.attachShadow ? container.attachShadow({
    mode: "open"
  }) : container;
  Object.defineProperty(container, "host", {
    get() {
      return marker.parentNode;
    }
  });
  insert(renderRoot, sample(() => props.children));
  mount.appendChild(container);
  props.ref && props.ref(container);
  onCleanup(() => mount.removeChild(container));
  return marker;
}
function dom_Dynamic(props) {
  const [p, others] = splitProps(props, ["component"]);
  return () => {
    const comp = p.component,
          t = typeof comp;
    if (comp) {
      if (t === "function") return sample(() => comp(others));else if (t === "string") {
        const el = document.createElement(comp);
        spread(el, others);
        return el;
      }
    }
  };
}



// EXTERNAL MODULE: external "solid-js"
var external_solid_js_ = __webpack_require__(0);

// CONCATENATED MODULE: ./src/renderer/render.jsx





const _tmpl$ = template(`<div id="sidebar"><div class="explorer" id="explorer"></div></div>`, 4),
      _tmpl$2 = template(`<div id="content">Counter: </div>`, 2),
      _tmpl$3 = template(`<div id="footer"><div id="title"></div></div>`, 4),
      _tmpl$4 = template(`<div id="app"></div>`, 2);




class render_Renderer {
  constructor() {
    this._react = null;
  }

  init() {
    const App = () => {
      // create solid state
      let [state, setState] = Object(external_solid_js_["createState"])({
        filePath: "not reactive!"
      });
      this._react = {
        state,
        setState
      }; // print file path on change

      Object(external_solid_js_["createEffect"])(() => console.log("\n\nfilePath:", state.filePath, "\n\n\n"));
      const [count, setCount] = Object(external_solid_js_["createSignal"])(0),
            timer = setInterval(() => setCount(count() + 1), 1000);
      Object(external_solid_js_["onCleanup"])(() => clearInterval(timer)); // components

      const AppSidebar = () => {
        return _tmpl$.cloneNode(true);
      };

      const AppContent = () => {
        return (() => {
          const _el$2 = _tmpl$2.cloneNode(true),
                _el$3 = _el$2.firstChild;

          insert(_el$2, () => count(), null);

          return _el$2;
        })();
      };

      const AppFooter = () => {
        return (() => {
          const _el$4 = _tmpl$3.cloneNode(true),
                _el$5 = _el$4.firstChild;

          _el$4.__click = () => setState("filePath", l => l + "!");

          insert(_el$5, () => state.filePath);

          return _el$4;
        })();
      };

      return (() => {
        const _el$6 = _tmpl$4.cloneNode(true);

        insert(_el$6, createComponent(AppSidebar, {}), null);

        insert(_el$6, createComponent(AppContent, {}), null);

        insert(_el$6, createComponent(AppFooter, {}), null);

        return _el$6;
      })();
    };

    render(() => createComponent(App, {}), document.body);
  }

}

/* harmony default export */ var renderer_render = (render_Renderer);

delegateEvents(["click"]);
// CONCATENATED MODULE: ./src/renderer/index.js
 ////////////////////////////////////////////////////////////

let renderer;

onload = function () {
  renderer = new renderer_render();
  renderer.init();
};

/***/ })
/******/ ]);
//# sourceMappingURL=renderer.js.map