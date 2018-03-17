!function(root, factory) {
    "object" === typeof exports && "object" === typeof module ? module.exports = factory() : "function" === typeof define && define.amd ? define([], factory) : "object" === typeof exports ? exports.ObservableData = factory() : root.ObservableData = factory();
}("undefined" !== typeof self ? self : this, function() {
    /******/
    return function(modules) {
        // webpackBootstrap
        /******/
        // The module cache
        /******/
        var installedModules = {};
        /******/
        /******/
        // The require function
        /******/
        function __webpack_require__(moduleId) {
            /******/
            /******/
            // Check if module is in cache
            /******/
            if (installedModules[moduleId]) /******/
            return installedModules[moduleId].exports;
            /******/
            // Create a new module (and put it into the cache)
            /******/
            var module = installedModules[moduleId] = {
                /******/
                i: moduleId,
                /******/
                l: false,
                /******/
                exports: {}
            };
            /******/
            /******/
            // Execute the module function
            /******/
            modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
            /******/
            /******/
            // Flag the module as loaded
            /******/
            module.l = true;
            /******/
            /******/
            // Return the exports of the module
            /******/
            return module.exports;
        }
        /******/
        /******/
        /******/
        // expose the modules object (__webpack_modules__)
        /******/
        __webpack_require__.m = modules;
        /******/
        /******/
        // expose the module cache
        /******/
        __webpack_require__.c = installedModules;
        /******/
        /******/
        // define getter function for harmony exports
        /******/
        __webpack_require__.d = function(exports, name, getter) {
            /******/
            __webpack_require__.o(exports, name) || /******/
            Object.defineProperty(exports, name, {
                /******/
                configurable: false,
                /******/
                enumerable: true,
                /******/
                get: getter
            });
        };
        /******/
        /******/
        // getDefaultExport function for compatibility with non-harmony modules
        /******/
        __webpack_require__.n = function(module) {
            /******/
            var getter = module && module.__esModule ? /******/
            function() {
                return module.default;
            } : /******/
            function() {
                return module;
            };
            /******/
            __webpack_require__.d(getter, "a", getter);
            /******/
            return getter;
        };
        /******/
        /******/
        // Object.prototype.hasOwnProperty.call
        /******/
        __webpack_require__.o = function(object, property) {
            return Object.prototype.hasOwnProperty.call(object, property);
        };
        /******/
        /******/
        // __webpack_public_path__
        /******/
        __webpack_require__.p = "";
        /******/
        /******/
        // Load entry module and return exports
        /******/
        return __webpack_require__(__webpack_require__.s = 8);
    }([ /* 0 */
    /***/
    function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_0__Set__ = __webpack_require__(11);
        /* unused harmony reexport Set */
        /* unused harmony reexport FakeSet */
        /* harmony reexport (binding) */
        __webpack_require__.d(__webpack_exports__, "a", function() {
            return __WEBPACK_IMPORTED_MODULE_0__Set__.a;
        });
    }, /* 1 */
    /***/
    function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        /* unused harmony export EventEmitter */
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_0__Compose__ = __webpack_require__(5);
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_1__dataStore__ = __webpack_require__(2);
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_2__es6_Set__ = __webpack_require__(0);
        //----------------------------------------------------------------
        var PRIVATE = __WEBPACK_IMPORTED_MODULE_1__dataStore__.a.create();
        var arraySlice = Function.call.bind(Array.prototype.slice);
        var isFunction = function(fn) {
            return "function" === typeof fn;
        };
        var objectKeys = Object.keys;
        /**
 * Emits events. Use it to extend other modules and thus add events to them.
 *
 * @class EventEmitter
 * @extends Compose
 */
        var EventEmitter = __WEBPACK_IMPORTED_MODULE_0__Compose__.a.extend(/** @lends EventEmitter.prototype */ {
            /**
     * Add a callback to a given event name
     *
     * @param {String} evName
     *  The event name to be listened to or a list of event sperated by a space.
     *  The EventEmitter instance can be used as the `evName` as well which will
     *  essentially listen to all events.
     *  Note that this special event however, will change the arguments
     *  passed to the callback by pre-pending the Event Name (`String`) and
     *  appending the Component instance.
     *
     * @param {Function} callback
     *  A callback function to listen to the event. The callback function
     *  can cancel any queued event callbacks by returning `true` (boolean).
     *
     * @return {EventEmitter#EventListener}
     *
     * @example
     *
     * events.on("some-event", (...args) => {});
     *
     * // List to all events
     * events.on(events, (evNameTriggered, ...args) => {}
     */
            on: function(evName, callback) {
                var _this = this;
                var _getSetup$call = getSetup.call(this), all = _getSetup$call.all, listeners = _getSetup$call.listeners;
                var events = getEventNameList(evName).reduce(function(eventList, eventName) {
                    var off = void 0;
                    // If eventName is `this` then listen to all events
                    if (eventName === _this) {
                        all.add(callback);
                        off = function() {
                            return all.delete(callback);
                        };
                    } else {
                        eventName in listeners || (listeners[eventName] = new __WEBPACK_IMPORTED_MODULE_2__es6_Set__.a());
                        listeners[eventName].add(callback);
                        off = function() {
                            return listeners[eventName].delete(callback);
                        };
                    }
                    eventList[eventName] = {
                        off: off
                    };
                    return eventList;
                }, {});
                /**
         * EventEmitter Listener object, returned when one of the listener setter methods
         * (ex. `on()`, `once()`, `pipe`) are used.
         *
         * @typedef {Object} EventEmitter~EventListener
         *
         * @property {Object} listeners
         *  An object with the individual listeners. Each respective event listener
         *  has an `off()` method to turn that listener off.
         *
         * @property {Function} off
         *  Remove callback from event.
         */
                var response = {
                    off: function() {
                        objectKeys(events).forEach(function(eventName) {
                            return events[eventName].off();
                        });
                    }
                };
                response.listeners = events;
                return response;
            },
            /**
     * Remove a callback from a given event
     *
     * @param {String} evName
     * @param {Function} callback
     *
     */
            off: function(evName, callback) {
                var _getSetup$call2 = getSetup.call(this), all = _getSetup$call2.all, listeners = _getSetup$call2.listeners;
                if (evName === this) {
                    all.delete(callback);
                    return;
                }
                listeners[evName] && listeners.delete(callback);
            },
            /**
     * Add a callback to a given event name that is executed only once.
     *
     * @param {String} evName
     *  The event name. This can be a list of event delimited with a space. Each
     *  event listeners will be triggered at most once.
     * @param {Function} callback
     *
     * @return {EventEmitter#EventListener}
     */
            once: function(evName, callback) {
                var _this2 = this;
                var events = getEventNameList(evName).reduce(function(eventListeners, eventName) {
                    var eventNameListener = _this2.on(evName, function() {
                        eventNameListener.off();
                        callback.apply(void 0, arguments);
                    });
                    eventListeners[eventName] = eventNameListener;
                    return eventListeners;
                }, {});
                var response = {
                    off: function() {
                        objectKeys(events).forEach(function(eventName) {
                            return events[eventName].off();
                        });
                    }
                };
                response.listeners = events;
                return response;
            },
            /**
     * Emit an event and execute any callback listening. Any of the listening
     * events can cancel the calling of queued callbacks by returning `true`
     * (boolean)
     *
     * @param {String} evName
     *  The event name to be triggered. __NOTE__: can not be a `"*"` or the EventEmitter
     *  instance since they holds special meaning.
     *
     * @param {...*} callbackArgs
     */
            emit: function(evName) {
                if ("*" === evName || evName === this) {
                    console.log("EventEmitter#emit(): can not emit to events to '*'");
                    // jshint ignore:line
                    return;
                }
                var setup = getSetup.call(this);
                var eventListeners = setup.listeners;
                var eventPipes = setup.pipes;
                var eventAll = setup.all;
                var args = arraySlice(arguments, 1);
                var isCanceled = false;
                var callbackHandler = function(callback) {
                    if (isFunction(callback)) {
                        var response = callback.apply(callback, args);
                        // if a boolean true was returned, don't call any more listeners.
                        if (true === response) {
                            isCanceled = true;
                            return true;
                        }
                    }
                };
                // Regular event listeners
                if (eventListeners[evName] && eventListeners[evName].size) {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = void 0;
                    try {
                        for (var _step, _iterator = eventListeners[evName][Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var cb = _step.value;
                            if (callbackHandler(cb)) break;
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            !_iteratorNormalCompletion && _iterator.return && _iterator.return();
                        } finally {
                            if (_didIteratorError) throw _iteratorError;
                        }
                    }
                }
                // Event listeners for all events
                if (!isCanceled && ("*" in eventListeners || eventAll.size)) {
                    // Special event "*": pass event name and instance
                    args = arraySlice(arguments, 0);
                    args.push(this);
                    if (eventListeners["*"] && eventListeners["*"].size) {
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = void 0;
                        try {
                            for (var _step2, _iterator2 = eventListeners["*"][Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var _cb = _step2.value;
                                if (callbackHandler(_cb)) break;
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                !_iteratorNormalCompletion2 && _iterator2.return && _iterator2.return();
                            } finally {
                                if (_didIteratorError2) throw _iteratorError2;
                            }
                        }
                    }
                    if (eventAll.size) {
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = void 0;
                        try {
                            for (var _step3, _iterator3 = eventAll[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var _cb2 = _step3.value;
                                if (callbackHandler(_cb2)) break;
                            }
                        } catch (err) {
                            _didIteratorError3 = true;
                            _iteratorError3 = err;
                        } finally {
                            try {
                                !_iteratorNormalCompletion3 && _iterator3.return && _iterator3.return();
                            } finally {
                                if (_didIteratorError3) throw _iteratorError3;
                            }
                        }
                    }
                    // set args back to original
                    args = arraySlice(arguments, 1);
                }
                if (eventPipes.size) {
                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = void 0;
                    try {
                        for (var _step4, _iterator4 = eventPipes[Symbol.iterator](); !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var pipe = _step4.value;
                            pipe && pipe(evName, args);
                        }
                    } catch (err) {
                        _didIteratorError4 = true;
                        _iteratorError4 = err;
                    } finally {
                        try {
                            !_iteratorNormalCompletion4 && _iterator4.return && _iterator4.return();
                        } finally {
                            if (_didIteratorError4) throw _iteratorError4;
                        }
                    }
                }
            },
            /**
     * Emit the events from one instance of EventEmitter to another. Useful
     * for when multiple components are used together as part of a larger
     * component and have the need to emit events to a common EventEmitter.
     *
     * @param {EventEmitter} pipeTo
     *  The EventEmitter instance object to where events should be piped.
     *  Can also be an object/class having an `emit(evName, data)` method.
     *
     * @param {String} [prefix]
     *  If defined, prefix will be added to any event emited. Example:
     *  if defining `foo-` as the prefix, then every event emitted will
     *  prefixed wth this value. So a `click` event on the source will
     *  be piped as `foo-click`.
     *
     * @param {Boolean} [includeInstance=true]
     *  When set to `true` (default), the piped event will include the source
     *  instance as an additional argument to the event that is piped.
     *
     *  @return {EventListener}
     */
            pipe: function(pipeTo, prefix, includeInstance) {
                var _this3 = this;
                if (!pipeTo || !pipeTo.emit) return {
                    off: function() {}
                };
                var pipes = getSetup.call(this).pipes;
                var pipeEvToReceiver = function(triggeredEvName, args) {
                    prefix ? args.unshift(prefix + triggeredEvName) : args.unshift(triggeredEvName);
                    (includeInstance || "undefined" === typeof includeInstance) && args.push(_this3);
                    pipeTo.emit.apply(pipeTo, args);
                };
                pipes.add(pipeEvToReceiver);
                return {
                    off: function() {
                        pipes.delete(pipeEvToReceiver);
                    }
                };
            },
            /**
     * Returns a boolean indicating if the current EventEmitter has listener
     * @returns {Boolean}
     */
            hasListeners: function() {
                var _getSetup$call3 = getSetup.call(this), listeners = _getSetup$call3.listeners, pipes = _getSetup$call3.pipes;
                return objectKeys(listeners).some(function(evName) {
                    return !!listeners[evName].size;
                }) || !!pipes.size;
            },
            destroy: function() {
                __WEBPACK_IMPORTED_MODULE_0__Compose__.a.prototype.destroy.call(this, true);
            }
        });
        /**
 * Returns the instance setup object. Creates it if it does not have one.
 * @private
 * @this EventEmitter
 */
        function getSetup() {
            if (!PRIVATE.has(this)) {
                /*
            listeners: {
                'evName': Set[ Callbacks ]
            },
            pipes: Set[ Callbacks ]
            all: Set[ Callbacks ]
        */
                PRIVATE.set(this, {
                    listeners: {},
                    pipes: new __WEBPACK_IMPORTED_MODULE_2__es6_Set__.a(),
                    all: new __WEBPACK_IMPORTED_MODULE_2__es6_Set__.a()
                });
                // When this object is destroyed, remove all data
                this.onDestroy && this.onDestroy(function() {
                    PRIVATE.has(this) && PRIVATE.delete(this);
                }.bind(this));
            }
            return PRIVATE.get(this);
        }
        function getEventNameList(eventNamesStr) {
            if ("string" === typeof eventNamesStr) return eventNamesStr.split(/\s+/);
            return [ eventNamesStr ];
        }
        /**
 * Adds event emitter functionality to an object
 *
 * @param {Object} target
 */
        EventEmitter.mixin = function(target) {
            target && [ "on", "off", "emit", "once", "pipe" ].forEach(function(method) {
                Object.defineProperty(target, method, {
                    configurable: true,
                    value: EventEmitter.prototype[method].bind(target)
                });
            });
        };
        /* harmony default export */
        __webpack_exports__.a = EventEmitter;
    }, /* 2 */
    /***/
    function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        /* unused harmony export dataStore */
        // POLYFILL FOR WEAKMAP
        //  [pt] changed how "delete" is defined so that it can work in IE8
        /* jshint ignore:start */
        /**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
        "undefined" === typeof WeakMap && function() {
            var defineProperty = Object.defineProperty;
            var counter = Date.now() % 1e9;
            var WeakMap = function() {
                this.name = "__st" + (1e9 * Math.random() >>> 0) + counter++ + "__";
            };
            WeakMap.prototype = {
                set: function(key, value) {
                    var entry = key[this.name];
                    entry && entry[0] === key ? entry[1] = value : defineProperty(key, this.name, {
                        value: [ key, value ],
                        writable: true
                    });
                    return this;
                },
                get: function(key) {
                    var entry;
                    return (entry = key[this.name]) && entry[0] === key ? entry[1] : void 0;
                },
                // [pt] Quotes around the delete property needed for IE8
                delete: function(key) {
                    var entry = key[this.name];
                    if (!entry || entry[0] !== key) return false;
                    entry[0] = entry[1] = void 0;
                    return true;
                },
                has: function(key) {
                    var entry = key[this.name];
                    if (!entry) return false;
                    return entry[0] === key;
                }
            };
            window.WeakMap = WeakMap;
        }();
        /* jshint ignore:end */
        /**
 * Returns an object that contains an initialized WeakMap (`stash` property)
 * where data can be stored.
 *
 * @namespace dataStore
 *
 */
        var dataStore = /** @lends dataStore */ {
            /**
   * Stash data here.
   * @type WeakMap
   */
            stash: new WeakMap(),
            /**
   * Create a private data store and return it.
   * @return {WeakMap}
   */
            create: function() {
                return new WeakMap();
            }
        };
        /* harmony default export */
        __webpack_exports__.a = dataStore;
    }, /* 3 */
    /***/
    function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        /* unused harmony export nextTick */
        var reIsNativeCode = /native code/i;
        /**
 * Executes a function at the end of the current event Loop - during micro-task processing
 *
 * @param {Function} callback
 */
        var nextTick = function() {
            if ("undefined" !== typeof setImediate && reIsNativeCode.test(setImediate.toString())) return setImediate;
            // Native Promsie? Use it.
            if ("function" === typeof Promise && reIsNativeCode.test(Promise.toString())) {
                var resolved = Promise.resolve();
                return function(fn) {
                    resolved.then(fn).catch(function(e) {
                        return console.log(e);
                    });
                };
            }
            // fallback to setTimeout
            // From: https://bugzilla.mozilla.org/show_bug.cgi?id=686201#c68
            var immediates = [];
            var processing = false;
            function processPending() {
                setTimeout(function() {
                    immediates.shift()();
                    immediates.length ? processPending() : processing = false;
                }, 0);
            }
            return function(fn) {
                immediates.push(fn);
                if (!processing) {
                    processing = true;
                    processPending();
                }
            };
        }();
        /* harmony default export */
        __webpack_exports__.a = nextTick;
    }, /* 4 */
    /***/
    function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        /* harmony export (binding) */
        __webpack_require__.d(__webpack_exports__, "d", function() {
            return PRIVATE;
        });
        /* unused harmony export INTERNAL_EVENTS */
        /* harmony export (binding) */
        __webpack_require__.d(__webpack_exports__, "a", function() {
            return EV_STOP_DEPENDEE_NOTIFICATION;
        });
        /* unused harmony export ARRAY_PROTOTYPE */
        /* harmony export (binding) */
        __webpack_require__.d(__webpack_exports__, "c", function() {
            return OBJECT_PROTOTYPE;
        });
        /* harmony export (binding) */
        __webpack_require__.d(__webpack_exports__, "b", function() {
            return IS_COMPUTED_NOTIFIER;
        });
        /* unused harmony export OBSERVABLE_FLAG */
        /* harmony export (binding) */
        __webpack_require__.d(__webpack_exports__, "f", function() {
            return bindCallTo;
        });
        /* unused harmony export dependeeList */
        /* harmony export (binding) */
        __webpack_require__.d(__webpack_exports__, "j", function() {
            return onInternalEvent;
        });
        /* unused harmony export emitInternalEvent */
        /* harmony export (binding) */
        __webpack_require__.d(__webpack_exports__, "g", function() {
            return isArray;
        });
        /* unused harmony export arrayIndexOf */
        /* unused harmony export arraySplice */
        /* harmony export (binding) */
        __webpack_require__.d(__webpack_exports__, "e", function() {
            return arrayForEach;
        });
        /* harmony export (binding) */
        __webpack_require__.d(__webpack_exports__, "i", function() {
            return isPureObject;
        });
        /* harmony export (binding) */
        __webpack_require__.d(__webpack_exports__, "h", function() {
            return isObservable;
        });
        /* harmony export (binding) */
        __webpack_require__.d(__webpack_exports__, "m", function() {
            return setObservableFlag;
        });
        /* harmony export (immutable) */
        __webpack_exports__.l = setDependencyTracker;
        /* harmony export (immutable) */
        __webpack_exports__.p = unsetDependencyTracker;
        /* harmony export (immutable) */
        __webpack_exports__.n = stopDependeeNotifications;
        /* harmony export (binding) */
        __webpack_require__.d(__webpack_exports__, "k", function() {
            return queueDependeeNotifier;
        });
        /* harmony export (immutable) */
        __webpack_exports__.o = storeDependeeNotifiers;
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_0_common_micro_libs_src_jsutils_EventEmitter__ = __webpack_require__(1);
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_1_common_micro_libs_src_jsutils_nextTick__ = __webpack_require__(3);
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_2_common_micro_libs_src_jsutils_dataStore__ = __webpack_require__(2);
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_3_common_micro_libs_src_jsutils_es6_Set__ = __webpack_require__(0);
        //=======================================================================
        var NOOP = function() {};
        var PRIVATE = __WEBPACK_IMPORTED_MODULE_2_common_micro_libs_src_jsutils_dataStore__.a.create();
        var INTERNAL_EVENTS = __WEBPACK_IMPORTED_MODULE_0_common_micro_libs_src_jsutils_EventEmitter__.a.create();
        var EV_STOP_DEPENDEE_NOTIFICATION = "1";
        var ARRAY_PROTOTYPE = Array.prototype;
        var OBJECT_PROTOTYPE = Object.prototype;
        var IS_COMPUTED_NOTIFIER = "__od_cn__";
        var bindCallTo = Function.call.bind.bind(Function.call);
        var dependeeList = new __WEBPACK_IMPORTED_MODULE_3_common_micro_libs_src_jsutils_es6_Set__.a();
        var onInternalEvent = INTERNAL_EVENTS.on.bind(INTERNAL_EVENTS);
        var emitInternalEvent = INTERNAL_EVENTS.emit.bind(INTERNAL_EVENTS);
        var isArray = Array.isArray;
        bindCallTo(ARRAY_PROTOTYPE.indexOf);
        bindCallTo(ARRAY_PROTOTYPE.splice);
        var arrayForEach = bindCallTo(ARRAY_PROTOTYPE.forEach);
        var isPureObject = function(obj) {
            return obj && "[object Object]" === OBJECT_PROTOTYPE.toString.call(obj);
        };
        var isObservable = function(obj) {
            return obj && obj.___observable_data___ === NOOP;
        };
        var setObservableFlag = function(obj) {
            return obj && Object.defineProperty(obj, "___observable_data___", {
                get: function() {
                    return NOOP;
                }
            });
        };
        /**
 * Allows for adding a Dependee notifier to the global list of dependency trackers.
 *
 * @param {Function} dependeeNotifier
 */
        function setDependencyTracker(dependeeNotifier) {
            dependeeNotifier && dependeeList.add(dependeeNotifier);
        }
        /**
 * Removes a Dependee notifier from the global list of dependency trackers.
 *
 * @param {Function} dependeeNotifier
 */
        function unsetDependencyTracker(dependeeNotifier) {
            if (!dependeeNotifier) return;
            dependeeList.delete(dependeeNotifier);
        }
        /**
 * Removes a Dependee notifier from any stored ObservableProperty list of dependees, thus
 * stopping all notifications to that depenedee.
 *
 * @param {Function} dependeeNotifier
 */
        function stopDependeeNotifications(dependeeNotifier) {
            dependeeNotifier && emitInternalEvent(EV_STOP_DEPENDEE_NOTIFICATION, dependeeNotifier);
        }
        var queueDependeeNotifier = function() {
            var dependeeNotifiers = new __WEBPACK_IMPORTED_MODULE_3_common_micro_libs_src_jsutils_es6_Set__.a();
            var execNotifiers = function() {
                dependeeNotifiers.forEach(function(notifierCb) {
                    return notifierCb();
                });
                dependeeNotifiers.clear();
            };
            return function(notifierCb) {
                // Computed property notifiers are lightweight, so execute
                // these now and don't queue them.
                if (notifierCb[IS_COMPUTED_NOTIFIER]) {
                    notifierCb();
                    return;
                }
                if (!notifierCb || dependeeNotifiers.has(notifierCb)) return;
                var callNextTick = !dependeeNotifiers.size;
                dependeeNotifiers.add(notifierCb);
                callNextTick && Object(__WEBPACK_IMPORTED_MODULE_1_common_micro_libs_src_jsutils_nextTick__.a)(execNotifiers);
            };
        }();
        function storeDependeeNotifiers(store) {
            store && dependeeList.size && dependeeList.forEach(function(dependeeCallback) {
                return store.add(dependeeCallback);
            });
        }
    }, /* 5 */
    /***/
    function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        /* unused harmony export getDestroyCallback */
        /* unused harmony export Compose */
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_0__objectExtend__ = __webpack_require__(6);
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_1__dataStore__ = __webpack_require__(2);
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_2__queueCallback__ = __webpack_require__(10);
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
        }
        function _possibleConstructorReturn(self, call) {
            if (!self) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" !== typeof call && "function" !== typeof call ? self : call;
        }
        function _inherits(subClass, superClass) {
            if ("function" !== typeof superClass && null !== superClass) throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: false,
                    writable: true,
                    configurable: true
                }
            });
            superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass);
        }
        //=========================================================
        var PRIVATE = __WEBPACK_IMPORTED_MODULE_1__dataStore__.a.create();
        var COMMON_DESTROY_METHOD_NAME = [ "destroy", // Compose
        "remove", // DOM Events Listeners
        "off" ];
        // Aliases
        Object.create;
        // return all KEYs of an object, even those that are not iterable
        function objectKeys(prototype) {
            var k = void 0, keys = [];
            for (k in prototype) keys.push(k);
            return keys;
        }
        // Base instance methods for Compose'd object
        var baseMethods = /** @lends Compose.prototype */ {
            /**
     * Property indicating whether instance has been destroyed
     */
            isDestroyed: false,
            /**
     * instance initializing code
     */
            init: function() {},
            /**
     * Destroys the instance, by removing its private data.
     * Any attached `onDestroy` callback will be executed `async` - queued and
     * called on next event loop
     *
     * @param {Boolean} [executeCallbacksNow=false]
     */
            destroy: function(executeCallbacksNow) {
                if (PRIVATE.has(this)) {
                    var destroyCallbacks = PRIVATE.get(this);
                    PRIVATE.delete(this);
                    executeCallbacksNow ? destroyCallbacks.forEach(callOnDestroyCallback) : Object(__WEBPACK_IMPORTED_MODULE_2__queueCallback__.a)(function() {
                        return destroyCallbacks.forEach(callOnDestroyCallback);
                    });
                }
                "boolean" === typeof this.isDestroyed && (this.isDestroyed = true);
            },
            /**
     * Adds a callback to the queue to be called when this object's `.destroy()`
     * is called.
     *
     * @param {Function} callback
     */
            onDestroy: function(callback) {
                getInstanceState(this).push(callback);
            },
            /**
     * Returns the factory for this instance.
     *
     * @return {Compose}
     */
            getFactory: function() {
                if (this.constructor) return this.constructor;
            }
        };
        var staticMethods = /** @lends Compose */ {
            /**
     * Creates an new factory based on the prototye of the current Factory
     * and any other Factory given on input.
     *
     * @return {Compose}
     */
            extend: function() {
                var Class = function(_ref) {
                    _inherits(Class, _ref);
                    function Class() {
                        _classCallCheck(this, Class);
                        return _possibleConstructorReturn(this, (Class.__proto__ || Object.getPrototypeOf(Class)).apply(this, arguments));
                    }
                    return Class;
                }(this);
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
                Object(__WEBPACK_IMPORTED_MODULE_0__objectExtend__.a)(Class.prototype, args.reduce(function(newProto, obj) {
                    if (obj) {
                        var thisObjProto = obj.prototype || obj;
                        objectKeys(thisObjProto).forEach(function(objKey) {
                            newProto[objKey] = thisObjProto[objKey];
                        });
                    }
                    return newProto;
                }, {}));
                return Class;
            },
            /**
     * Checks if the Object given on input looks like an instance of this Factory.
     *
     * @return {Boolean}
     */
            isInstanceOf: function(instanceObj) {
                if (!instanceObj) return false;
                var neededKeys = objectKeys(this.prototype);
                // If any prototype key is not in the object prototype, then return false
                return !neededKeys.some(function(protoKey) {
                    return "undefined" === typeof instanceObj[protoKey];
                });
            },
            /**
     * Creates an instance object based on this factory.
     *
     * @return {Object}
     */
            create: function() {
                return new (Function.prototype.bind.apply(this, [ null ].concat(Array.prototype.slice.call(arguments))))();
            },
            /**
     * Returns a standard callback that can be used to remove cleanup instance state
     * from specific Store (WeakMap). Returned function will destroy known Instances
     * that have destroy methods.
     *
     * @param {Object} instanceState
     * @param {WeakMap} [stateStore]
     *
     * @return {Function}
     *
     * @example
     *
     * const MY_PRIVATE = new WeakMap();
     * cont NewWdg = Componse.extend({
     *      init() {
     *          const state = {};
     *          MY_PRIVATE.set(this, state);
     *          ...
     *
     *          this.onDestroy(Compose.getDestroyCallback(state, MY_PRIVATE));
     *      }
     * });
     */
            getDestroyCallback: getDestroyCallback
        };
        /**
 * Returns a standard callback that can be used to remove cleanup instance state
 * from specific Store (WeakMap). Returned function will destroy known Instances
 * that have destroy methods.
 *
 * @method Compose~getDestroyCallback
 *
 * @param {Object} instanceState
 * @param {WeakMap} [stateStore]
 *
 * @return {Function}
 *
 * @example
 *
 * const MY_PRIVATE = new WeakMap();
 * cont NewWdg = Componse.extend({
 *      init() {
 *          const state = {};
 *          MY_PRIVATE.set(this, state);
 *          ...
 *
 *          this.onDestroy(Compose.getDestroyCallback(state, MY_PRIVATE));
 *      }
 * });
 */
        function getDestroyCallback(instanceState, stateStore) {
            return function() {
                instanceState && // Destroy all Compose object
                Object.keys(instanceState).forEach(function(prop) {
                    if (instanceState[prop]) {
                        COMMON_DESTROY_METHOD_NAME.some(function(method) {
                            if (instanceState[prop][method] && ("remove" !== method || !(instanceState[prop] instanceof Node))) {
                                instanceState[prop][method]();
                                return true;
                            }
                        });
                        instanceState[prop] = void 0;
                    }
                });
                stateStore && stateStore.has && stateStore.has(instanceState) && stateStore.delete(instanceState);
            };
        }
        function getInstanceState(inst) {
            PRIVATE.has(inst) || PRIVATE.set(inst, []);
            return PRIVATE.get(inst);
        }
        function callOnDestroyCallback(callback) {
            "function" === typeof callback && callback();
        }
        /**
 * Composes new factory methods from a list of given Objects/Classes.
 *
 * @class Compose
 * @borrows Compose~getDestroyCallback as Compose.getDestroyCallback
 *
 * @example
 *
 * var Widget = Compose.create(Model, Events);
 *
 * myWidget = Widget.create();
 *
 */
        var Compose = function() {
            function ComposeConstructor() {
                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) args[_key2] = arguments[_key2];
                // Called with `new`?
                if (this && this.constructor && this instanceof this.constructor) return this.init.apply(this, args);
                // called directly
                return new (Function.prototype.bind.apply(ComposeConstructor, [ null ].concat(args)))();
            }
            ComposeConstructor.prototype.constructor = ComposeConstructor;
            return ComposeConstructor;
        }();
        Object(__WEBPACK_IMPORTED_MODULE_0__objectExtend__.a)(Compose.prototype, baseMethods);
        Object(__WEBPACK_IMPORTED_MODULE_0__objectExtend__.a)(Compose, staticMethods);
        /* harmony default export */
        __webpack_exports__.a = Compose;
    }, /* 6 */
    /***/
    function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        /* unused harmony export objectExtend */
        var OBJECT_TYPE = "[object Object]";
        var _toString = Function.call.bind(Object.prototype.toString);
        //============================================================
        /**
 * Extends an object with the properties of another.
 *
 * @param {Object|Boolean} mergeIntoObj
 *  The object that will have the properties of every other object provided
 *  on input merged into. This can also be a `Boolean`, in which case,
 *  a deep merge of objects will be done - argument number 2 will
 *  become the `mergeIntoObj`.
 * @param {...Object} mergeObjects
 *
 * @return {Object}
 */
        function objectExtend(mergeIntoObj) {
            var response = mergeIntoObj || {};
            for (var _len = arguments.length, mergeObjects = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) mergeObjects[_key - 1] = arguments[_key];
            var total = mergeObjects.length;
            var deepMerge = false;
            var i = void 0;
            var key = void 0;
            if ("boolean" === typeof mergeIntoObj) {
                deepMerge = mergeIntoObj;
                response = mergeObjects.shift() || {};
                total = mergeObjects.length;
            }
            for (i = 0; i < total; i++) {
                if (!mergeObjects[i]) continue;
                for (key in mergeObjects[i]) mergeObjects[i].hasOwnProperty(key) && (deepMerge && _toString(response[key]) === OBJECT_TYPE && _toString(mergeObjects[i][key]) === OBJECT_TYPE ? response[key] = objectExtend(true, response[key], mergeObjects[i][key]) : response[key] = mergeObjects[i][key]);
            }
            return response;
        }
        /* harmony default export */
        __webpack_exports__.a = objectExtend;
    }, /* 7 */
    /***/
    function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        /* unused harmony export functionBind */
        /* unused harmony export functionBindCall */
        /* harmony export (binding) */
        __webpack_require__.d(__webpack_exports__, "c", function() {
            return objectDefineProperty;
        });
        /* harmony export (binding) */
        __webpack_require__.d(__webpack_exports__, "b", function() {
            return objectDefineProperties;
        });
        /* unused harmony export objectKeys */
        /* unused harmony export arrayForEach */
        /* harmony export (binding) */
        __webpack_require__.d(__webpack_exports__, "a", function() {
            return arrayIndexOf;
        });
        /* unused harmony export arraySplice */
        // Function
        // functionBind(fn, fnParent)
        var functionBind = Function.bind.call.bind(Function.bind);
        // functionBindCall(Array.prototype.forEach)
        var functionBindCall = functionBind(Function.call.bind, Function.call);
        // Object
        var objectDefineProperty = Object.defineProperty;
        var objectDefineProperties = Object.defineProperties;
        Object.keys;
        // Array
        var arr = [];
        functionBindCall(arr.forEach);
        var arrayIndexOf = functionBindCall(arr.indexOf);
        functionBindCall(arr.splice);
    }, /* 8 */
    /***/
    function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        Object.defineProperty(__webpack_exports__, "__esModule", {
            value: true
        });
        /* harmony export (immutable) */
        __webpack_exports__.observeAll = observeAll;
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_0__ObservableArray__ = __webpack_require__(9);
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_1__ObservableObject__ = __webpack_require__(15);
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_2__common__ = __webpack_require__(4);
        /* harmony reexport (binding) */
        __webpack_require__.d(__webpack_exports__, "ObservableArray", function() {
            return __WEBPACK_IMPORTED_MODULE_0__ObservableArray__.a;
        });
        /* harmony reexport (binding) */
        __webpack_require__.d(__webpack_exports__, "ObservableObject", function() {
            return __WEBPACK_IMPORTED_MODULE_1__ObservableObject__.a;
        });
        function _toConsumableArray(arr) {
            if (Array.isArray(arr)) {
                for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
                return arr2;
            }
            return Array.from(arr);
        }
        //==================================================================
        /**
 * Observes all data - object and arrays - given on input.
 *
 * @param {...Object|...Array} data
 */
        function observeAll() {
            for (var _len = arguments.length, data = Array(_len), _key = 0; _key < _len; _key++) data[_key] = arguments[_key];
            Object(__WEBPACK_IMPORTED_MODULE_2__common__.e)(data, function(dataItem) {
                if (Object(__WEBPACK_IMPORTED_MODULE_2__common__.h)(dataItem)) return;
                if (Object(__WEBPACK_IMPORTED_MODULE_2__common__.i)(dataItem)) Object(__WEBPACK_IMPORTED_MODULE_1__ObservableObject__.b)(dataItem, null, true, function(propValue) {
                    propValue && Object(__WEBPACK_IMPORTED_MODULE_2__common__.g)(propValue) && observeAll(propValue);
                }); else if (Object(__WEBPACK_IMPORTED_MODULE_2__common__.g)(dataItem)) {
                    Object(__WEBPACK_IMPORTED_MODULE_0__ObservableArray__.b)(dataItem);
                    observeAll.apply(void 0, _toConsumableArray(dataItem));
                }
            });
        }
    }, /* 9 */
    /***/
    function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        /* harmony export (immutable) */
        __webpack_exports__.b = mixin;
        /* unused harmony export ObservableArray */
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_0_common_micro_libs_src_jsutils_EventEmitter__ = __webpack_require__(1);
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_1_common_micro_libs_src_jsutils_nextTick__ = __webpack_require__(3);
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_2_common_micro_libs_src_jsutils_es6_Set__ = __webpack_require__(0);
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_3__common__ = __webpack_require__(4);
        /* unused harmony reexport setDependencyTracker */
        /* unused harmony reexport unsetDependencyTracker */
        /* unused harmony reexport stopDependeeNotifications */
        function _toConsumableArray(arr) {
            if (Array.isArray(arr)) {
                for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
                return arr2;
            }
            return Array.from(arr);
        }
        //==============================================================
        var ArrayPrototype = Array.prototype;
        var objectDefineProp = Object.defineProperty;
        var objectKeys = Object.keys;
        var emit = Object(__WEBPACK_IMPORTED_MODULE_3__common__.f)(__WEBPACK_IMPORTED_MODULE_0_common_micro_libs_src_jsutils_EventEmitter__.a.prototype.emit);
        var changeMethods = [ "pop", "push", "shift", "splice", "unshift", "sort", "reverse" ];
        var addMethods = [ "push", "splice", "unshift" ];
        var removeMethods = [ "pop", "shift", "splice" ];
        /**
 * An Array like object with the added ability to listen to events.
 * It supports all methods available to a normal array, like `forEach`,
 * `some` and `reduce`
 *
 * @class ObservableArray
 *
 * @extends EventEmitter
 * @extends Array
 *
 * @fires ObservableArray#change
 */
        var ObservableArray = __WEBPACK_IMPORTED_MODULE_0_common_micro_libs_src_jsutils_EventEmitter__.a.extend(/** @lends ObservableArray.prototype */ {
            /**
     * The length of the array. Unlike the `length` property, this one is able
     * to notify dependees if any are set to be track dependencies.
     *
     * @name len
     * @type {Number}
     */
            // For backwards compatible with initial version
            // use `len` property instead
            size: function() {
                Object(__WEBPACK_IMPORTED_MODULE_3__common__.o)(getInstance(this).dependees);
                return this.length;
            },
            /**
     * Returns a member of the collection given an index (zero based),
     * or updates the item at a given index with a new value.
     *
     * @param {Number} index
     * @param {*} [newValue]
     */
            item: function(index) {
                var args = ArrayPrototype.slice.call(arguments, 0);
                var _array = this;
                Object(__WEBPACK_IMPORTED_MODULE_3__common__.o)(getInstance(this).dependees);
                // GET mode..
                if (1 === args.length) return _array[index];
                // Update mode... Emits event
                var events = getNewEventObject();
                if (_array[index] === args[1]) events.updated = [ args[1] ]; else {
                    events.removed = [ _array[index] ];
                    events.added = [ args[1] ];
                }
                var updateResponse = _array[index] = args[1];
                notifyDependees(_array, events);
                return updateResponse;
            }
        });
        function getInstance(obArray) {
            if (!__WEBPACK_IMPORTED_MODULE_3__common__.d.has(obArray)) {
                var dependees = new __WEBPACK_IMPORTED_MODULE_2_common_micro_libs_src_jsutils_es6_Set__.a();
                var isQueued = false;
                var nextEvent = null;
                var storeEventData = function(events) {
                    if (!events) return;
                    nextEvent || (nextEvent = getNewEventObject());
                    objectKeys(events).forEach(function(eventName) {
                        var _nextEvent$eventName;
                        if (!events[eventName]) return;
                        nextEvent[eventName] || (nextEvent[eventName] = []);
                        (_nextEvent$eventName = nextEvent[eventName]).push.apply(_nextEvent$eventName, _toConsumableArray(events[eventName]));
                    });
                };
                var inst = {
                    dependees: dependees,
                    notify: function(events) {
                        // Queue up calling all dependee notifiers
                        dependees.forEach(function(cb) {
                            return Object(__WEBPACK_IMPORTED_MODULE_3__common__.k)(cb);
                        });
                        storeEventData(events);
                        if (isQueued) return;
                        isQueued = true;
                        Object(__WEBPACK_IMPORTED_MODULE_1_common_micro_libs_src_jsutils_nextTick__.a)(function() {
                            var eventData = nextEvent;
                            nextEvent = null;
                            /**
                     * ObservableArray was changed.
                     *
                     * @event ObservableArray#change
                     * @type {ObservableArray~ObservableArrayChangeEvent}
                     */
                            emit(obArray, "change", eventData);
                            isQueued = false;
                        });
                    }
                };
                __WEBPACK_IMPORTED_MODULE_3__common__.d.set(obArray, inst);
                var ev1 = Object(__WEBPACK_IMPORTED_MODULE_3__common__.j)(__WEBPACK_IMPORTED_MODULE_3__common__.a, function(cb) {
                    dependees.delete(cb);
                });
                obArray.onDestroy && obArray.onDestroy(function() {
                    dependees.clear();
                    ev1.off();
                    __WEBPACK_IMPORTED_MODULE_3__common__.d.delete(obArray);
                });
            }
            return __WEBPACK_IMPORTED_MODULE_3__common__.d.get(obArray);
        }
        /**
 * Converts an array instance methods to a wrapped version that can detect changes
 * and also track dependee notifiers when data is accessed from the array
 *
 * @param {Array} arr
 *
 * @return {Array}
 */
        function makeArrayObservable(arr) {
            // If it looks like this array is already an being observered, then exit.
            if (Object(__WEBPACK_IMPORTED_MODULE_3__common__.h)(arr)) return;
            Object(__WEBPACK_IMPORTED_MODULE_3__common__.m)(arr);
            var arrCurrentProto = arr.__proto__;
            // eslint-disable-line
            var newArrProto = void 0;
            // If we already have a wrapped prototype for this array's
            // current prototype, then just use that
            if (__WEBPACK_IMPORTED_MODULE_3__common__.d.has(arrCurrentProto)) newArrProto = __WEBPACK_IMPORTED_MODULE_3__common__.d.get(arrCurrentProto); else {
                // Create new Array instance prototype
                newArrProto = Object.create(arrCurrentProto);
                // Add all methods of Array.prototype to the collection
                Object.getOwnPropertyNames(ArrayPrototype).forEach(function(method) {
                    if ("constructor" === method || "function" !== typeof ArrayPrototype[method]) return;
                    var origMethod = newArrProto[method];
                    var doEvents = -1 !== changeMethods.indexOf(method);
                    var canAdd = -1 !== addMethods.indexOf(method);
                    var canRemove = -1 !== removeMethods.indexOf(method);
                    var isArraySplice = "splice" === method;
                    objectDefineProp(newArrProto, method, {
                        value: function() {
                            var _this = this;
                            Object(__WEBPACK_IMPORTED_MODULE_3__common__.o)(getInstance(this).dependees);
                            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
                            var response = origMethod.call.apply(origMethod, [ this ].concat(args));
                            // If the response is an array, then add method to it that allows it
                            // to be converted to an observable
                            Object(__WEBPACK_IMPORTED_MODULE_3__common__.g)(response) && response !== this && objectDefineProp(response, "toObservable", {
                                value: function() {
                                    if (_this.getFactory) return _this.getFactory().create(response);
                                    return mixin(response);
                                }
                            });
                            // If Array method can manipulate the array, then emit event
                            if (doEvents) {
                                var events = getNewEventObject();
                                // Add Events
                                canAdd && (isArraySplice ? args.length > 2 && (events.added = args.slice(2)) : events.added = args);
                                canRemove && (events.removed = isArraySplice ? response : [ response ]);
                                notifyDependees(this, events);
                            }
                            return response;
                        },
                        writable: true,
                        configurable: true
                    });
                });
                // Add `len` property, which is shorthand for `length` but with added
                // ability to observe for array changes when called and trigger notifiers
                // when changed.
                objectDefineProp(newArrProto, "len", {
                    get: function() {
                        Object(__WEBPACK_IMPORTED_MODULE_3__common__.o)(getInstance(this).dependees);
                        return this.length;
                    },
                    set: function(n) {
                        var response = this.length = n;
                        notifyDependees(this);
                        return response;
                    },
                    configurable: true
                });
                __WEBPACK_IMPORTED_MODULE_3__common__.d.set(arrCurrentProto, newArrProto);
            }
            arr.__proto__ = newArrProto;
            // eslint-disable-line
            return arr;
        }
        function notifyDependees(arrObj, events) {
            getInstance(arrObj).notify(events);
        }
        /**
 * Make an array instance observable in place
 *
 * @param {Array} arr
 *
 * @return {Array}
 */
        function mixin(arr) {
            Object(__WEBPACK_IMPORTED_MODULE_3__common__.g)(arr) || (arr = []);
            return ObservableArray.create(arr);
        }
        // Define the "create" factory method that will then redefine each
        // our proxyied methods of Array prototype into the array instance
        objectDefineProp(ObservableArray, "create", {
            value: function(arrayInstance) {
                var observable = arrayInstance || [];
                var thisPrototype = this.prototype;
                if (Object(__WEBPACK_IMPORTED_MODULE_3__common__.h)(observable)) return observable;
                makeArrayObservable(observable);
                var observableProto = Object.create(observable.__proto__);
                // eslint-disable-line
                // FIXME: we should be caching this new object (prototype) defined above...
                // Copy all methods in this prototype to the Array instance
                for (var prop in thisPrototype) /* eslint-disable */
                objectDefineProp(observableProto, prop, {
                    value: thisPrototype[prop],
                    writable: true,
                    configurable: true
                });
                objectDefineProp(observableProto, "constructor", {
                    value: this
                });
                observable.__proto__ = observableProto;
                observable.init && observable.init.apply(observable, arguments);
                return observable;
            }
        });
        function getNewEventObject() {
            /**
     * The array was changed.
     *
     * @typedef {Object} ObservableArray~ObservableArrayChangeEvent
     * @property {Array|null} added
     * @property {Array|null} removed
     * @property {Array|null} updated
     */
            return {
                added: null,
                removed: null,
                updated: null
            };
        }
        /* harmony default export */
        __webpack_exports__.a = ObservableArray;
    }, /* 10 */
    /***/
    function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        /* unused harmony export queueCallback */
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_0__es6_Set__ = __webpack_require__(0);
        function _toConsumableArray(arr) {
            if (Array.isArray(arr)) {
                for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
                return arr2;
            }
            return Array.from(arr);
        }
        //===============================================
        var callbacks = new __WEBPACK_IMPORTED_MODULE_0__es6_Set__.a();
        var queue = void 0;
        /**
 * Queue a callback to be executed after at the start of next event loop.
 * This differs from `nextTick` in that callbacks are not executed during
 * micro-processing, but rather on next event loop, so this is not ideal
 * for logic that can cause UI reflow.
 *
 * @param {Function} cb
 */
        function queueCallback(cb) {
            if ("function" === typeof cb) {
                callbacks.add(cb);
                queue || (queue = setTimeout(flushQueue, 0));
            }
        }
        /* harmony default export */
        __webpack_exports__.a = queueCallback;
        function flushQueue() {
            var cbList = [].concat(_toConsumableArray(callbacks));
            callbacks.clear();
            queue = null;
            var cb = void 0;
            for (;cb = cbList.shift(); ) {
                cb();
                cb = null;
            }
        }
    }, /* 11 */
    /***/
    function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        /* harmony export (binding) */
        __webpack_require__.d(__webpack_exports__, "a", function() {
            return Set;
        });
        /* unused harmony export FakeSet */
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_0__getGlobal__ = __webpack_require__(12);
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_1__Iterator__ = __webpack_require__(14);
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_2__runtime_aliases__ = __webpack_require__(7);
        //============================================================
        var Set = Object(__WEBPACK_IMPORTED_MODULE_0__getGlobal__.a)().Set || FakeSet;
        function FakeSet() {}
        Object(__WEBPACK_IMPORTED_MODULE_2__runtime_aliases__.b)(FakeSet.prototype, {
            constructor: {
                value: FakeSet,
                configurable: true
            },
            _: {
                get: function() {
                    var values = [];
                    Object(__WEBPACK_IMPORTED_MODULE_2__runtime_aliases__.c)(this, "_", {
                        value: values
                    });
                    return values;
                }
            },
            add: {
                value: function(item) {
                    -1 === Object(__WEBPACK_IMPORTED_MODULE_2__runtime_aliases__.a)(this._, item) && this._.push(item);
                    return this;
                }
            },
            has: {
                value: function(item) {
                    return -1 !== Object(__WEBPACK_IMPORTED_MODULE_2__runtime_aliases__.a)(this._, item);
                }
            },
            size: {
                get: function() {
                    return this._.length;
                }
            },
            clear: {
                value: function() {
                    this._.splice(0);
                }
            },
            delete: {
                value: function(item) {
                    var idx = Object(__WEBPACK_IMPORTED_MODULE_2__runtime_aliases__.a)(this._, item);
                    if (-1 !== idx) {
                        this._.splice(idx, 1);
                        return true;
                    }
                    return false;
                }
            },
            values: {
                value: function() {
                    return new __WEBPACK_IMPORTED_MODULE_1__Iterator__.a(this._);
                }
            },
            entries: {
                value: function() {
                    return new __WEBPACK_IMPORTED_MODULE_1__Iterator__.a(this._, this._);
                }
            },
            forEach: {
                value: function(cb) {
                    var _this = this;
                    this._.forEach(function(item) {
                        return cb(item, item, _this);
                    });
                }
            }
        });
    }, /* 12 */
    /***/
    function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        /* WEBPACK VAR INJECTION */
        (function(global) {
            /* unused harmony export GLOBAL */
            /* unused harmony export getGlobal */
            var GLOBAL = function() {
                /* global self, window, global */
                if ("undefined" !== typeof window) return window;
                if ("undefined" !== typeof global) return global;
                if ("undefined" !== typeof self) return self;
                return Function("return this;")();
            }();
            function getGlobal() {
                return GLOBAL;
            }
            /* harmony default export */
            __webpack_exports__.a = getGlobal;
        }).call(__webpack_exports__, __webpack_require__(13));
    }, /* 13 */
    /***/
    function(module, exports) {
        var _typeof = "function" === typeof Symbol && "symbol" === typeof Symbol.iterator ? function(obj) {
            return typeof obj;
        } : function(obj) {
            return obj && "function" === typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
        var g;
        // This works in non-strict mode
        g = function() {
            return this;
        }();
        try {
            // This works if eval is allowed (see CSP)
            g = g || Function("return this")() || (0, eval)("this");
        } catch (e) {
            // This works if the window reference is available
            "object" === ("undefined" === typeof window ? "undefined" : _typeof(window)) && (g = window);
        }
        // g can still be undefined, but nothing to do about it...
        // We return undefined, instead of nothing here, so it's
        // easier to handle this case. if(!global) { ...}
        module.exports = g;
    }, /* 14 */
    /***/
    function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        /* harmony export (immutable) */
        __webpack_exports__.a = FakeIterator;
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_0__runtime_aliases__ = __webpack_require__(7);
        //-----------------------------------------------------------------------
        var $iterator$ = "undefined" !== typeof Symbol && Symbol.iterator ? Symbol.iterator : "@@iterator";
        // Great reference: http://2ality.com/2015/02/es6-iteration.html
        function FakeIterator(keys, values) {
            Object(__WEBPACK_IMPORTED_MODULE_0__runtime_aliases__.c)(this, "_", {
                value: {
                    keys: keys.slice(0),
                    values: values ? values.slice(0) : null,
                    idx: 0,
                    total: keys.length
                }
            });
        }
        Object(__WEBPACK_IMPORTED_MODULE_0__runtime_aliases__.b)(FakeIterator.prototype, {
            constructor: {
                value: FakeIterator
            },
            next: {
                enumerable: true,
                configurable: true,
                value: function() {
                    var response = {
                        done: this._.idx === this._.total
                    };
                    if (response.done) {
                        response.value = void 0;
                        return response;
                    }
                    var nextIdx = this._.idx++;
                    response.value = this._.keys[nextIdx];
                    this._.values && (response.value = [ response.value, this._.values[nextIdx] ]);
                    return response;
                }
            }
        });
        Object(__WEBPACK_IMPORTED_MODULE_0__runtime_aliases__.c)(FakeIterator.prototype, $iterator$, {
            value: function() {
                return this;
            }
        });
    }, /* 15 */
    /***/
    function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        /* unused harmony export createComputedProp */
        /* unused harmony export observableAssign */
        /* harmony export (immutable) */
        __webpack_exports__.b = makeObservable;
        /* unused harmony export watchProp */
        /* unused harmony export watchPropOnce */
        /* unused harmony export unwatchProp */
        /* unused harmony export notifyPropWatchers */
        /* unused harmony export observableMixin */
        /* unused harmony export ObservableObject */
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_0_common_micro_libs_src_jsutils_Compose__ = __webpack_require__(5);
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_1_common_micro_libs_src_jsutils_objectExtend__ = __webpack_require__(6);
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_2_common_micro_libs_src_jsutils_EventEmitter__ = __webpack_require__(1);
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_3_common_micro_libs_src_jsutils_nextTick__ = __webpack_require__(3);
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_4_common_micro_libs_src_jsutils_es6_Set__ = __webpack_require__(0);
        /* harmony import */
        var __WEBPACK_IMPORTED_MODULE_5__common__ = __webpack_require__(4);
        /* unused harmony reexport setDependencyTracker */
        /* unused harmony reexport unsetDependencyTracker */
        /* unused harmony reexport stopDependeeNotifications */
        function _toConsumableArray(arr) {
            if (Array.isArray(arr)) {
                for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
                return arr2;
            }
            return Array.from(arr);
        }
        //=======================================================
        var OBJECT = Object;
        // aliases
        var objectCreate = OBJECT.create;
        var objectDefineProperty = OBJECT.defineProperty;
        var objectHasOwnProperty = Object(__WEBPACK_IMPORTED_MODULE_5__common__.f)(__WEBPACK_IMPORTED_MODULE_5__common__.c.hasOwnProperty);
        var objectKeys = Object.keys;
        var noopEventListener = objectCreate({
            off: function() {}
        });
        /**
 * Adds the ability to observe `Object` property values for changes.
 * Uses an internal `EventEmitter` instance to list and trigger events,
 * and `Object.defineProperty` getter/setters to setup watchers on
 * property values.
 *
 * Currently has no support for addition or deletion from the object,
 * but with the ES7 forth coming Proxy functionality, that will be
 * added.
 *
 * @class ObservableObject
 * @extends Compose
 *
 * @param {Object} [model]
 * @param {Object} [options]
 * @param {Boolean} [options.watchAll=true]
 *  if `model` was given on input, then all properties will be automatically made watchable.
 * @param {Boolean} [options.deep=true]
 *  If set to true, the model is walked and all deep objects made observable as well
 *
 * @example
 *
 * // Used as a mixin
 * var myObj = {
 *      first: "paul",
 *      last: "tavares"
 * };
 *
 * ObservableObject.mixin(myObj);
 *
 * myObj.on("first", function(newValue, oldValue){
 *      alert("first name was changed");
 * });
 *
 * @example
 *
 * // Used as part of a class prototype
 * var MyModel = Compose.extend(ObservableObject);
 *
 * var user = MyModel.create({
 *      first: "paul",
 *      last: "tavares"
 * });
 *
 * user.on("first", function(newValue, oldValue){
 *  alert("first name was change")
 * });
 *
 */
        var ObservableObject = __WEBPACK_IMPORTED_MODULE_0_common_micro_libs_src_jsutils_Compose__.a.extend(/** @lends ObservableObject.prototype */ {
            init: function(model, options) {
                var opt = Object(__WEBPACK_IMPORTED_MODULE_1_common_micro_libs_src_jsutils_objectExtend__.a)({}, this.getFactory().defaults, options);
                if (model) {
                    // FIXME: need to create prop that uses original getter/setters from `model` - or no?
                    Object(__WEBPACK_IMPORTED_MODULE_1_common_micro_libs_src_jsutils_objectExtend__.a)(this, model);
                    opt.watchAll && makeObservable(this, null, opt.deep);
                    getInstance(this).opt = opt;
                }
            },
            /**
     * Add a callback to changes on a given property
     *
     * @param {String|Object} prop
     *  Object property name. If wanting to list to all changes to the object, the
     *  object instance itself can be passed as the prop.
     *
     * @param {Function} callback
     *  A callback function to list to the event. The callback function
     *  can cancel any queued event callbacks by returning `true` (boolean).
     *
     * @return {EventListener}
     *
     * @example
     *
     * obj.on("firstName", () => {});
     *
     * // List to all changes
     * obj.on(obj, () => {});
     */
            on: function(prop, callback) {
                return watchProp(this, prop, callback);
            },
            /**
     * Remove a callback the listening queue of a for a given property name
     *
     * @param {String} prop
     *  Object property name
     *
     * @param {Function} callback
     *  The callback that should be removed.
     */
            off: function(prop, callback) {
                unwatchProp(this, prop, callback);
            },
            /**
     * Add a callback for changes on a given property that is called only once
     *
     * @param {String} prop
     *  Object property name
     *
     * @param {Function} callback
     *  The callback that should be removed.
     */
            once: function(prop, callback) {
                return watchPropOnce(this, prop, callback);
            },
            /**
     * Emit an event and execute any callback listening. Any of the listening
     * events can cancel the calling of queued callbacks by returning `true`
     * (boolean)
     *
     * @param {String} prop
     */
            emit: function(prop) {
                return notifyPropWatchers(this, prop);
            },
            /**
     * Copies the properties of one or more objects into the current observable
     * and makes those properties "watchable".
     *
     * @param {...Object} args
     *
     * @returns {Object}
     */
            assign: function() {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
                return observableAssign.apply(void 0, [ this ].concat(_toConsumableArray(args)));
            },
            /**
     * Sets a property on the observable object and automatically makes it watchable
     *
     * @param {String} propName
     * @param {*} [value]
     * @returns {*}
     */
            setProp: function(propName, value) {
                makePropWatchable(this, propName);
                return this[propName] = value;
            }
        });
        /**
 * Returns the private Instance data for this object
 *
 * @private
 * @param {Object} observableObj
 *
 * @return {EventEmitter}
 */
        function getInstance(observableObj) {
            if (!__WEBPACK_IMPORTED_MODULE_5__common__.d.has(observableObj)) {
                var instData = __WEBPACK_IMPORTED_MODULE_2_common_micro_libs_src_jsutils_EventEmitter__.a.create();
                var watched = instData.watched = {};
                var isQueued = false;
                Object(__WEBPACK_IMPORTED_MODULE_5__common__.m)(observableObj);
                instData.opt = Object(__WEBPACK_IMPORTED_MODULE_1_common_micro_libs_src_jsutils_objectExtend__.a)({}, ObservableObject.defaults);
                instData.notify = function() {
                    if (isQueued) return;
                    isQueued = true;
                    Object(__WEBPACK_IMPORTED_MODULE_3_common_micro_libs_src_jsutils_nextTick__.a)(function() {
                        instData.emit("");
                        isQueued = false;
                    });
                };
                __WEBPACK_IMPORTED_MODULE_5__common__.d.set(observableObj, instData);
                observableObj.onDestroy && observableObj.onDestroy(function() {
                    objectKeys(watched).forEach(function(propName) {
                        watched[propName].destroy();
                        // FIXME remove property getter/setter on the object (if still there)
                        delete watched[propName];
                    });
                    delete instData.watched;
                    __WEBPACK_IMPORTED_MODULE_5__common__.d.delete(observableObj);
                    instData.destroy();
                }.bind(observableObj));
            }
            return __WEBPACK_IMPORTED_MODULE_5__common__.d.get(observableObj);
        }
        /**
 * A property setup
 *
 * @private
 * @class Observable~PropertySetup
 * @extends Compose
 */
        var PropertySetup = __WEBPACK_IMPORTED_MODULE_0_common_micro_libs_src_jsutils_Compose__.a.extend(/** @lends Observable~PropertySetup.prototype */ {
            init: function(observable, propName) {
                var _this = this;
                this.dependees = new __WEBPACK_IMPORTED_MODULE_4_common_micro_libs_src_jsutils_es6_Set__.a();
                this.propName = propName;
                this._obj = observable;
                this.onDestroy(function() {
                    _this.dependees.clear();
                    _this.rmDepEvListener && _this.rmDepEvListener.off();
                    _this._obj = null;
                });
            },
            propName: "",
            /** @type Array */
            dependees: null,
            oldVal: null,
            newVal: null,
            queued: false,
            isComputed: false,
            /**
     * Notifies everyone that is listening for events on this property
     *
     * @param [noDelay=false]
     */
            notify: function(noDelay) {
                var _this2 = this;
                var propSetup = this;
                // Queue up calling all dependee notifiers
                this.dependees.forEach(function(cb) {
                    return Object(__WEBPACK_IMPORTED_MODULE_5__common__.k)(cb);
                });
                // If emitting of events for this property was already queued, exit
                if (propSetup.queued) return;
                propSetup.queued = true;
                if (noDelay) {
                    this._emit();
                    return;
                }
                Object(__WEBPACK_IMPORTED_MODULE_3_common_micro_libs_src_jsutils_nextTick__.a)(function() {
                    return _this2._emit();
                });
            },
            _emit: function() {
                this.queued = false;
                getInstance(this._obj).emit(this.propName, this.newVal, this.oldVal);
                this.oldVal = null;
            },
            /**
     * Removes a callback from the list of dependees
     * @param {Function} cb
     */
            removeDependee: function(cb) {
                this.dependees.delete(cb);
                // Remove listener if no dependees
                if (this.rmDepEvListener && 0 === this.dependees.size) {
                    this.rmDepEvListener.off();
                    this.rmDepEvListener = null;
                }
            },
            /**
     * Stores global dependees into this Property list of dependees
     */
            storeDependees: function() {
                Object(__WEBPACK_IMPORTED_MODULE_5__common__.o)(this.dependees);
                // If we have dependees, then setup an internal event bus listener
                this.dependees.size > 0 && !this.rmDepEvListener && (this.rmDepEvListener = Object(__WEBPACK_IMPORTED_MODULE_5__common__.j)(__WEBPACK_IMPORTED_MODULE_5__common__.a, this.removeDependee.bind(this)));
            }
        });
        /**
 * Checks to see if a given property on this object already has a watcher
 * and if not, it sets one up for it.
 *
 * @private
 * @param {ObservableObject} observable
 * @param {String} propName
 * @param {Function} [valueGetter]
 * @param {Function} [valueSetter]
 * @param {Boolean} [enumerable=true]
 *
 * @return {EventEmitter}
 */
        function makePropWatchable(observable, propName, valueGetter, valueSetter) {
            var enumerable = !(arguments.length > 4 && void 0 !== arguments[4]) || arguments[4];
            var inst = getInstance(observable);
            var watched = inst.watched;
            if (watched[propName]) return inst;
            var currentValue = void 0;
            var emitNotification = !(propName in observable);
            var propDescriptor = Object.getOwnPropertyDescriptor(observable, propName);
            if (propDescriptor) {
                if (false === propDescriptor.configurable) // TODO: should we throw()?
                return;
                valueGetter = valueGetter || propDescriptor.get;
                valueSetter = valueSetter || propDescriptor.set;
                valueGetter || (currentValue = propDescriptor.value);
            }
            // if we're able to remove the current property (ex. Constants would fail),
            // then change this attribute to be watched
            if (delete observable[propName]) {
                var propSetup = watched[propName] = PropertySetup.create(observable, propName);
                propSetup.oldVal = propSetup.newVal = currentValue;
                objectDefineProperty(observable, propName, {
                    enumerable: enumerable,
                    configurable: true,
                    // Getter will either delegate to the prior getter(),
                    // or return the value that was originally assigned to the property
                    get: function() {
                        propSetup.storeDependees();
                        return valueGetter ? valueGetter() : propSetup.newVal;
                    },
                    // Setter is how we detect changes to the value.
                    set: function(newValue) {
                        if (propSetup.isComputed) return;
                        var oldValue = valueGetter ? valueGetter() : propSetup.newVal;
                        if (valueSetter) newValue = valueSetter.call(observable, newValue); else {
                            propSetup.oldVal = oldValue;
                            propSetup.newVal = newValue;
                        }
                        // Dirty checking...
                        // Only trigger if values are different. Also, only add a trigger
                        // if one is not already queued.
                        if (newValue !== oldValue) {
                            inst.opt.deep && newValue && Object(__WEBPACK_IMPORTED_MODULE_5__common__.i)(newValue) && makeObservable(newValue, null, true);
                            propSetup.notify();
                        }
                    }
                });
            } else console.log(new Error("Unable to watch property [" + propName + "] - delete failed"));
            emitNotification && inst.notify();
            return inst;
        }
        /**
 * Created a computed property on a given object
 *
 * @param {Object} observable
 * @param {String} propName
 * @param {Function} valueGenerator
 * @param {Boolean} [enumerable=true]
 */
        function createComputedProp(observable, propName, valueGenerator) {
            var enumerable = !(arguments.length > 3 && void 0 !== arguments[3]) || arguments[3];
            if (observable && propName && valueGenerator) {
                var runValueGenerator = true;
                var propValue = void 0;
                var dependencyChangeNotifier = function() {
                    // Trigger the Object property setter(). This does nothing as far as the
                    // computed value does, but provides compatibility for any code that
                    // might have overwritten the setter in order ot also listen for changes
                    // outside of this lib.
                    observable[propName] = "";
                    // Reset the internally cached prop value and set the flag to run the
                    // generator and then notify listeners.
                    propValue = null;
                    runValueGenerator = true;
                    getInstance(observable).watched[propName].notify();
                };
                var valueGetter = function() {
                    // FIXME: should we detect circular loops?
                    if (!runValueGenerator) return propValue;
                    Object(__WEBPACK_IMPORTED_MODULE_5__common__.l)(dependencyChangeNotifier);
                    try {
                        propValue = valueGenerator.call(observable);
                    } catch (e) {
                        Object(__WEBPACK_IMPORTED_MODULE_5__common__.p)(dependencyChangeNotifier);
                        throw e;
                    }
                    Object(__WEBPACK_IMPORTED_MODULE_5__common__.p)(dependencyChangeNotifier);
                    runValueGenerator = false;
                    return propValue;
                };
                var valueSetter = function() {
                    /* FIXME: should this anything? */
                    return propValue;
                };
                var inst = getInstance(observable);
                dependencyChangeNotifier[__WEBPACK_IMPORTED_MODULE_5__common__.b] = true;
                // If this propName is already being watched, then first destroy that instance
                if (propName in inst.watched) {
                    inst.watched[propName].destroy();
                    delete inst.watched[propName];
                }
                makePropWatchable(observable, propName, valueGetter, valueSetter, enumerable);
                inst.watched[propName].isComputed = true;
                inst.watched[propName].onDestroy(function() {
                    Object(__WEBPACK_IMPORTED_MODULE_5__common__.n)(dependencyChangeNotifier);
                    delete inst.watched[propName];
                    delete observable[propName];
                    observable[propName] = propValue;
                });
                return Object.create({
                    destroy: function() {
                        inst.watched[propName] && inst.watched[propName].destroy(true);
                    }
                });
            }
        }
        /**
 * Assign the properties of one (or more) objects to the observable and
 * makes those properties "watchable"
 *
 * @param {Object} observable
 * @param {...Object} objs
 *
 * @return {Object} observable
 */
        function observableAssign(observable) {
            for (var _len2 = arguments.length, objs = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) objs[_key2 - 1] = arguments[_key2];
            objs.length && Object(__WEBPACK_IMPORTED_MODULE_5__common__.e)(objs, function(obj) {
                Object(__WEBPACK_IMPORTED_MODULE_5__common__.e)(objectKeys(obj), function(key) {
                    makePropWatchable(observable, key);
                    observable[key] = obj[key];
                });
            });
            return observable;
        }
        /**
 * Makes an Object observable or a given property of the object observable.
 *
 * @param {Object} observable
 *  The object that should be made observable.
 *
 * @param {String} [propName]
 *  if left unset, then all existing `own properties` of the object will
 *  be made observable.
 *
 * @param {Boolean} [deep=false]
 *  If set to `true` then the object, or the value the given `prop` (if defined)
 *  will be "walked" and any object found made an observable as well.
 *
 * @param {Function} [onEach]
 *  A callback function to be called as each property is "walked". The property value
 *  is provided on input to the callback
 */
        function makeObservable(observable, propName, deep, onEach) {
            if (observable) {
                propName ? makePropWatchable(observable, propName) : Object(__WEBPACK_IMPORTED_MODULE_5__common__.e)(objectKeys(observable), function(prop) {
                    return makePropWatchable(observable, prop);
                });
                deep && Object(__WEBPACK_IMPORTED_MODULE_5__common__.e)(objectKeys(observable), function(key) {
                    observable[key] && Object(__WEBPACK_IMPORTED_MODULE_5__common__.i)(observable[key]) && makeObservable(observable[key], null, deep, onEach);
                    onEach && onEach(observable[key]);
                });
            }
        }
        /**
 * Watch a given object property for changes.
 *
 * @param {Object} observable
 * @param {String} propName
 *  The `observable` property name or, if wanting to list to all property changes,
 *  the actual `observable` instance
 * @param {Function} notifier
 *
 * @returns {EventEmitter#EventListener}
 */
        function watchProp(observable, propName, notifier) {
            var inst = getInstance(observable);
            if (propName === observable) return inst.on(inst, notifier);
            if (objectHasOwnProperty(observable, propName)) {
                makePropWatchable(observable, propName);
                return inst.on(propName, notifier);
            }
            return noopEventListener;
        }
        /**
 * Watch for changes on a given object property only once
 * (automatically stops listening after the first invocation).
 *
 * @param {Object} observable
 * @param {String} propName
 * @param {Function} notifier
 * @returns {EventEmitter#EventListener}
 */
        function watchPropOnce(observable, propName, notifier) {
            var inst = getInstance(observable);
            if (propName === observable) return inst.once(inst, notifier);
            if (objectHasOwnProperty(observable, propName)) {
                makePropWatchable(observable, propName);
                return inst.once(propName, notifier);
            }
            return noopEventListener;
        }
        /**
 * Stop watching an object property.
 *
 * @param {Object} observable
 * @param {String} propName
 * @param {Function} notifier
 */
        function unwatchProp(observable, propName, notifier) {
            return getInstance(observable).off(propName, notifier);
        }
        /**
 * Notifies watchers of a given Observable property
 *
 * @param {Object} observable
 * @param {String} propName
 */
        function notifyPropWatchers(observable, propName) {
            var watched = getInstance(observable).watched;
            watched[propName] && watched[propName].notify(true);
        }
        /**
 * Adds ObservableObject capabilities to an object.
 *
 * @method ObservableObject.mixin
 *
 * @param {Object} observable
 *
 * @return {Object}
 *  Same object that was given on input will be returned
 */
        function observableMixin(observable) {
            observable && Object(__WEBPACK_IMPORTED_MODULE_5__common__.e)(objectKeys(ObservableObject.prototype), function(method) {
                method in observable && observable[method] === ObservableObject.prototype[method] || objectDefineProperty(observable, method, {
                    value: ObservableObject.prototype[method],
                    enumerable: false,
                    configurable: true
                });
            });
            return observable;
        }
        ObservableObject.createComputed = createComputedProp;
        ObservableObject.mixin = observableMixin;
        /**
 * Default options to the ObservableObject constructor
 *
 * @type Object
 * @name ObservableObject.defaults
 */
        ObservableObject.defaults = {
            watchAll: true,
            deep: true
        };
        /* harmony default export */
        __webpack_exports__.a = ObservableObject;
    } ]);
});
//# sourceMappingURL=observable-data.js.map