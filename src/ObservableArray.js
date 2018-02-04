import EventEmitter from "common-micro-libs/src/jsutils/EventEmitter"
import nextTick     from "common-micro-libs/src/jsutils/nextTick"
import Set          from "common-micro-libs/src/jsutils/es6-Set"

import {
    PRIVATE,
    EV_STOP_DEPENDEE_NOTIFICATION,
    OBSERVABLE_FLAG,
    onInternalEvent,
    storeDependeeNotifiers,
    setDependencyTracker,
    unsetDependencyTracker,
    stopDependeeNotifications,
    queueDependeeNotifier,
    isArray,
    bindCallTo,
    setObservableFlag,
    isObservable
} from "./common"

//==============================================================
const ArrayPrototype    = Array.prototype;
const objectDefineProp  = Object.defineProperty;
const objectKeys        = Object.keys;
const emit              = bindCallTo(EventEmitter.prototype.emit);
const changeMethods     = ['pop', 'push', 'shift', 'splice', 'unshift', 'sort', 'reverse'];
const addMethods        = ['push', 'splice', 'unshift'];
const removeMethods     = ['pop', 'shift', 'splice'];

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
let ObservableArray = EventEmitter.extend(/** @lends ObservableArray.prototype */{

    /**
     * The length of the array. Unlike the `length` property, this one is able
     * to notify dependees if any are set to be track dependencies.
     *
     * @name len
     * @type {Number}
     */

    // For backwards compatible with initial version
    // use `len` property instead
    size: function(){
        storeDependeeNotifiers(getInstance(this).dependees);
        return this.length;
    },

    /**
     * Returns a member of the collection given an index (zero based),
     * or updates the item at a given index with a new value.
     *
     * @param {Number} index
     * @param {*} [newValue]
     */
    item: function (index){
        let args    = ArrayPrototype.slice.call(arguments, 0);
        let _array  = this;

        storeDependeeNotifiers(getInstance(this).dependees);

        // GET mode..
        if (args.length === 1) {
            return _array[index];
        }

        // Update mode... Emits event
        let events = getNewEventObject();
        if (_array[index] === args[1]) {
            events.updated = [ args[1] ];
        } else {
            events.removed   = [ _array[index] ];
            events.added     = [ args[1] ];
        }

        let updateResponse = _array[index] = args[1];
        notifyDependees(_array, events);

        return updateResponse;
    }
});

function getInstance (obArray) {
    if (!PRIVATE.has(obArray)) {
        const dependees = new Set();
        let isQueued = false;
        let nextEvent = null;
        const storeEventData = events => {
            if (!events) {
                return;
            }

            if (!nextEvent) {
                nextEvent = getNewEventObject();
            }

            objectKeys(events).forEach(eventName => {
                if (!events[eventName]) {
                    return;
                }

                if (!nextEvent[eventName]) {
                    nextEvent[eventName] = [];
                }

                nextEvent[eventName].push(...events[eventName]);
            });
        };
        const inst = {
            dependees: dependees,

            notify(events) {
                // Queue up calling all dependee notifiers
                dependees.forEach(cb => queueDependeeNotifier(cb));
                storeEventData(events);

                if (isQueued) {
                    return;
                }

                isQueued = true;
                nextTick(() => {
                    let eventData = nextEvent;
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

        PRIVATE.set(obArray, inst);

        const ev1 = onInternalEvent(EV_STOP_DEPENDEE_NOTIFICATION, cb => {
            dependees.delete(cb);
        });

        if (obArray.onDestroy) {
            obArray.onDestroy(() => {
                dependees.clear();
                ev1.off();
                PRIVATE.delete(obArray);
            });
        }
    }
    return PRIVATE.get(obArray);
}

/**
 * Converts an array instance methods to a wrapped version that can detect changes
 * and also track dependee notifiers when data is accessed from the array
 *
 * @param {Array} arr
 *
 * @return {Array}
 */
function makeArrayObservable (arr) {
    // If it looks like this array is already an being observered, then exit.
    if (isObservable(arr)) {
        return;
    }

    setObservableFlag(arr);

    const arrCurrentProto = arr.__proto__; // eslint-disable-line
    let newArrProto;

    // If we already have a wrapped prototype for this array's
    // current prototype, then just use that
    if (PRIVATE.has(arrCurrentProto)) {
        newArrProto = PRIVATE.get(arrCurrentProto); // eslint-disable-line
    }
    // ELSE: create a wrapped prototype for this array's prototype
    else {
        // Create new Array instance prototype
        newArrProto = Object.create(arrCurrentProto);

        // Add all methods of Array.prototype to the collection
        Object.getOwnPropertyNames(ArrayPrototype).forEach(function(method){
            if (method === "constructor" || typeof ArrayPrototype[method] !== "function") {
                return;
            }

            const origMethod    = newArrProto[method];
            const doEvents      = changeMethods.indexOf(method) !== -1;
            const canAdd        = addMethods.indexOf(method)    !== -1;
            const canRemove     = removeMethods.indexOf(method) !== -1;
            const isArraySplice = method === "splice";

            objectDefineProp(newArrProto, method, {
                value: function observable(...args){
                    storeDependeeNotifiers(getInstance(this).dependees);

                    let response = origMethod.call(this, ...args);

                    // If the response is an array, then add method to it that allows it
                    // to be converted to an observable
                    if (isArray(response) && response !== this) {
                        objectDefineProp(response, "toObservable", {
                            value: () => {
                                if (this.getFactory) {
                                    return this.getFactory().create(response);
                                }

                                return mixin(response);
                            }
                        });
                    }

                    // If Array method can manipulate the array, then emit event
                    if (doEvents) {
                        let events = getNewEventObject();

                        // Add Events
                        if (canAdd) {
                            if (isArraySplice) {
                                if (args.length > 2) {
                                    events.added = args.slice(2);
                                }
                            }
                            else {
                                events.added = args;
                            }
                        }

                        if (canRemove) {
                            if (isArraySplice) {
                                events.removed = response;
                            }
                            else {
                                events.removed = [ response ];
                            }
                        }

                        notifyDependees(this, events);
                    }

                    return response;
                },
                writable:       true,
                configurable:   true
            });
        });

        // Add `len` property, which is shorthand for `length` but with added
        // ability to observe for array changes when called and trigger notifiers
        // when changed.
        objectDefineProp(newArrProto, "len", {
            get() {
                storeDependeeNotifiers(getInstance(this).dependees);
                return this.length;
            },

            set(n) {
                const response = this.length = n;
                notifyDependees(this);
                return response;
            },

            configurable: true
        });

        PRIVATE.set(arrCurrentProto, newArrProto);
    }

    arr.__proto__ = newArrProto; // eslint-disable-line

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
export function mixin(arr) {
    if (!isArray(arr)) {
        arr = [];
    }

    return ObservableArray.create(arr);
}

// Define the "create" factory method that will then redefine each
// our proxyied methods of Array prototype into the array instance
objectDefineProp(ObservableArray, "create", {
    value: function(arrayInstance){
        let observable      = arrayInstance || [];
        let thisPrototype   = this.prototype;

        if (isObservable(observable)) {
            return observable;
        }

        makeArrayObservable(observable);
        const observableProto = Object.create(observable.__proto__); // eslint-disable-line

        // FIXME: we should be caching this new object (prototype) defined above...

        // Copy all methods in this prototype to the Array instance
        for (let prop in thisPrototype){
            /* eslint-disable */
            objectDefineProp(observableProto, prop, {
                value:          thisPrototype[prop],
                writable:       true,
                configurable:   true
            });
            /* eslint-enable */
        }

        objectDefineProp(observableProto, "constructor", { value: this });
        observable.__proto__ = observableProto;

        if (observable.init) {
            observable.init.apply(observable, arguments);
        }

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
    return { added: null, removed: null, updated: null };
}


export default ObservableArray;
export {
    ObservableArray,
    setDependencyTracker,
    unsetDependencyTracker,
    stopDependeeNotifications
};
