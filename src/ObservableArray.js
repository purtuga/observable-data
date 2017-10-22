import EventEmitter from "common-micro-libs/src/jsutils/EventEmitter"
import dataStore    from "common-micro-libs/src/jsutils/dataStore"
import nextTick     from "common-micro-libs/src/jsutils/nextTick"

import {
    EV_STOP_DEPENDEE_NOTIFICATION,
    onInternalEvent,
    storeDependeeNotifiers,
    setDependencyTracker,
    unsetDependencyTracker,
    stopDependeeNotifications,
    queueDependeeNotifier,
    isArray,
    arrayForEach,
    arraySplice,
    arrayIndexOf
} from "./common"

//==============================================================
const PRIVATE           = dataStore.create();
const OBSERVABLE_FLAG   = "___observable_array___";
const ArrayPrototype    = Array.prototype;
const objectDefineProp  = Object.defineProperty;
const noop              = () => {};
const isObservable      = arr => arr[OBSERVABLE_FLAG] === noop;
const changeMethods     = [
    'pop',
    'push',
    'shift',
    'splice',
    'unshift',
    'sort',
    'reverse'
];

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
        let updateResponse = _array[index] = args[1];
        notifyDependees(_array);

        return updateResponse;
    }
});

function getInstance (obArray) {
    if (!PRIVATE.has(obArray)) {
        const dependees = [];
        let isQueued = false;
        const inst = {
            dependees: dependees,

            notify() {
                // Queue up calling all dependee notifiers
                arrayForEach(dependees, cb => queueDependeeNotifier(cb));

                if (isQueued) {
                    return;
                }

                /**
                 * ObservableArray was changed. Event will provide the value returned
                 * by the Array method that made the change.
                 *
                 * @event ObservableArray#change
                 * @type {*}
                 */
                nextTick(() => {
                    EventEmitter.prototype.emit.call(obArray, "change");
                    isQueued = false;
                });
            }
        };

        PRIVATE.set(obArray, inst);

        const ev1 = onInternalEvent(EV_STOP_DEPENDEE_NOTIFICATION, cb => {
            const cbIndex = arrayIndexOf(dependees, cb);
            if (cbIndex !== -1) {
                arraySplice(dependees, cbIndex, 1);
            }
        });

        if (obArray.onDestroy) {
            obArray.onDestroy(() => {
                dependees.splice(0);
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

    objectDefineProp(arr, OBSERVABLE_FLAG, { get: () => noop });

    // Add all methods of Array.prototype to the collection
    Object.getOwnPropertyNames(ArrayPrototype).forEach(function(method){
        if (method === "constructor" || typeof ArrayPrototype[method] !== "function") {
            return;
        }

        const origMethod    = arr[method].bind(arr);
        const doEvents      = changeMethods.indexOf(method) !== -1;

        // FIXME: would use of Object.setPrototypeOf or setting [].__proto__ be better? Need to investigate
        objectDefineProp(arr, method, {
            value: function(...args){
                storeDependeeNotifiers(getInstance(this).dependees);

                let response = origMethod(...args);

                // If the response is an array and its not this instance, then
                // ensure it is an instance of this ObservableArray
                if (isArray(response) && response !== this && this.getFactory) {
                    response = this.getFactory().create(response);
                }

                // If Array method can manipulate the array, then emit event
                if (doEvents) {
                    notifyDependees(this);
                }

                return response;
            },
            writable:       true,
            configurable:   true
        });
    });

    objectDefineProp(arr, "len", {
        get() {
            storeDependeeNotifiers(getInstance(this).dependees);
            return this.length;
        },
        configurable: true
    });

    return arr;
}

function notifyDependees(arrObj) {
    getInstance(arrObj).notify();
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
        let instance        = arrayInstance || [];
        let thisPrototype   = this.prototype;

        if (isObservable(instance)) {
            return instance;
        }

        makeArrayObservable(instance);

        // Copy all methods in this prototype to the Array instance
        for (let prop in thisPrototype){
            /* eslint-disable */
            objectDefineProp(instance, prop, {
                value:          thisPrototype[prop],
                writable:       true,
                configurable:   true
            });
            /* eslint-enable */
        }

        if (instance.init) {
            instance.init.apply(instance, arguments);
        }

        return instance;
    }
});

export default ObservableArray;

export {
    setDependencyTracker,
    unsetDependencyTracker,
    stopDependeeNotifications
};
