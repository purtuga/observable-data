import Compose          from "common-micro-libs/src/jsutils/Compose"
import objectExtend     from "common-micro-libs/src/jsutils/objectExtend"
import EventEmitter     from "common-micro-libs/src/jsutils/EventEmitter"
import nextTick         from "common-micro-libs/src/jsutils/nextTick"
import Set              from "common-micro-libs/src/jsutils/es6-Set"

import {
    PRIVATE,
    EV_STOP_DEPENDEE_NOTIFICATION,
    IS_COMPUTED_NOTIFIER,
    OBJECT_PROTOTYPE,
    setDependencyTracker,
    unsetDependencyTracker,
    stopDependeeNotifications,
    storeDependeeNotifiers,
    queueDependeeNotifier,
    bindCallTo,
    arrayForEach,
    onInternalEvent,
    isPureObject,
    setObservableFlag
} from "./common"

//=======================================================
const OBJECT                = Object;

// aliases
const objectCreate          = OBJECT.create;
const objectDefineProperty  = OBJECT.defineProperty;
const objectHasOwnProperty  = bindCallTo(OBJECT_PROTOTYPE.hasOwnProperty);

const objectKeys            = Object.keys;
const noopEventListener     = objectCreate({ off() {} });

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
const ObservableObject = Compose.extend(/** @lends ObservableObject.prototype */{
    init(model, options) {
        const opt = objectExtend({}, this.getFactory().defaults, options);

        if (model) {
            // FIXME: need to create prop that uses original getter/setters from `model` - or no?
            objectExtend(this, model);

            if (opt.watchAll) {
                makeObservable(this, null, opt.deep);
            }

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
    on: function(prop, callback){
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
    off: function(prop, callback){
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
    once: function(prop, callback){
        return watchPropOnce(this, prop, callback);
    },

    /**
     * Emit an event and execute any callback listening. Any of the listening
     * events can cancel the calling of queued callbacks by returning `true`
     * (boolean)
     *
     * @param {String} prop
     */
    emit: function(prop){
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
    assign(...args) {
        return observableAssign(this, ...args);
    },

    /**
     * Sets a property on the observable object and automatically makes it watchable
     *
     * @param {String} propName
     * @param {*} [value]
     * @returns {*}
     */
    setProp(propName, value) {
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
function getInstance(observableObj){
    if (!PRIVATE.has(observableObj)) {
        const instData = EventEmitter.create();
        const watched = instData.watched = {};
        let isQueued = false;

        setObservableFlag(observableObj);
        instData.opt = objectExtend({}, ObservableObject.defaults);
        instData.notify = () => {
            if (isQueued) {
                return;
            }
            isQueued = true;
            nextTick(() => {
                instData.emit("");
                isQueued = false;
            });
        };

        PRIVATE.set(observableObj, instData);

        if (observableObj.onDestroy) {
            observableObj.onDestroy(function(){
                objectKeys(watched).forEach(propName => {
                    watched[propName].destroy();

                    // FIXME remove property getter/setter on the object (if still there)

                    delete watched[propName];
                });

                delete instData.watched;
                PRIVATE.delete(observableObj);
                instData.destroy();
            }.bind(observableObj));
        }
    }
    return PRIVATE.get(observableObj);
}

/**
 * A property setup
 *
 * @private
 * @class Observable~PropertySetup
 * @extends Compose
 */
const PropertySetup = Compose.extend(/** @lends Observable~PropertySetup.prototype */{
    init(observable, propName) {
        this.dependees = new Set();
        this.propName = propName;
        this._obj = observable;

        this.onDestroy(() => {
            this.dependees.clear();
            if (this.rmDepEvListener) {
                this.rmDepEvListener.off();
            }
            this._obj = null;
        })
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
    notify(noDelay){
        const propSetup = this;

        // Queue up calling all dependee notifiers
        for (let cb of this.dependees) {
            queueDependeeNotifier(cb);
        }

        // If emitting of events for this property was already queued, exit
        if (propSetup.queued) {
            return;
        }

        propSetup.queued = true;

        if (noDelay) {
            this._emit();
            return;
        }

        nextTick(() => this._emit());
    },

    _emit() {
        this.queued = false;
        getInstance(this._obj).emit(this.propName, this.newVal, this.oldVal);
        this.oldVal = null;
    },

    /**
     * Removes a callback from the list of dependees
     * @param {Function} cb
     */
    removeDependee(cb) {
        this.dependees.delete(cb);
        // Remove listener if no dependees
        if (this.rmDepEvListener && this.dependees.size === 0) {
            this.rmDepEvListener.off();
            this.rmDepEvListener = null;
        }
    },

    /**
     * Stores global dependees into this Property list of dependees
     */
    storeDependees() {
        storeDependeeNotifiers(this.dependees);

        // If we have dependees, then setup an internal event bus listener
        if (this.dependees.size > 0 && !this.rmDepEvListener) {
            this.rmDepEvListener = onInternalEvent(EV_STOP_DEPENDEE_NOTIFICATION, this.removeDependee.bind(this));
        }
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
function makePropWatchable(observable, propName, valueGetter, valueSetter, enumerable = true){
    let inst    = getInstance(observable);
    let watched = inst.watched;

    if (watched[propName]){
        return inst;
    }

    let currentValue;
    const emitNotification  = !(propName in observable);
    const propDescriptor    = Object.getOwnPropertyDescriptor(observable, propName);

    if (propDescriptor) {
        if (propDescriptor.configurable === false) {
            // TODO: should we throw()?
            return;
        }

        valueGetter = valueGetter || propDescriptor.get;
        valueSetter = valueSetter || propDescriptor.set;

        if (!valueGetter) {
            currentValue = propDescriptor.value;
        }
    }

    // if we're able to remove the current property (ex. Constants would fail),
    // then change this attribute to be watched
    if (delete observable[propName]) {
        const propSetup = watched[propName] = PropertySetup.create(observable, propName);

        propSetup.oldVal = propSetup.newVal = currentValue;

        objectDefineProperty(observable, propName, {
            enumerable,
            configurable:   true,

            // Getter will either delegate to the prior getter(),
            // or return the value that was originally assigned to the property
            get: function(){
                propSetup.storeDependees();
                return valueGetter ? valueGetter() : propSetup.newVal;
            },

            // Setter is how we detect changes to the value.
            set: function(newValue){
                if (propSetup.isComputed) {
                    return; // TODO: should throw? or console.warn  ?
                }

                let oldValue = valueGetter ? valueGetter() : propSetup.newVal;

                if (valueSetter) {
                    newValue = valueSetter.call(observable, newValue);

                } else {
                    propSetup.oldVal = oldValue;
                    propSetup.newVal = newValue;
                }

                // Dirty checking...
                // Only trigger if values are different. Also, only add a trigger
                // if one is not already queued.
                if (newValue !== oldValue) {
                    if (inst.opt.deep && newValue && isPureObject(newValue)) {
                        makeObservable(newValue, null, true);
                    }

                    propSetup.notify();
                }
            }
        });

    } else {
        console.log(new Error("Unable to watch property [" + propName + "] - delete failed"));
    }

    if (emitNotification) {
        inst.notify();
    }

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
export function createComputedProp(observable, propName, valueGenerator, enumerable = true) {
    if (observable && propName && valueGenerator) {
        let runValueGenerator = true;
        let propValue;
        const dependencyChangeNotifier = () => {
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
        const valueGetter = () => {
            // FIXME: should we detect circular loops?

            if (!runValueGenerator) {
                return propValue;
            }

            setDependencyTracker(dependencyChangeNotifier);

            try {
                propValue = valueGenerator.call(observable);
            }
            catch(e) {
                unsetDependencyTracker(dependencyChangeNotifier);
                throw e;
            }

            unsetDependencyTracker(dependencyChangeNotifier);
            runValueGenerator = false;
            return propValue;
        };
        const valueSetter = () => {
            /* FIXME: should this anything? */
            return propValue;
        };
        const inst = getInstance(observable);

        dependencyChangeNotifier[IS_COMPUTED_NOTIFIER] = true;

        // If this propName is already being watched, then first destroy that instance
        if (propName in inst.watched) {
            inst.watched[propName].destroy();
            delete inst.watched[propName];
        }

        makePropWatchable(observable, propName, valueGetter, valueSetter, enumerable);

        inst.watched[propName].isComputed = true;
        inst.watched[propName].onDestroy(() => {
            stopDependeeNotifications(dependencyChangeNotifier);
            delete inst.watched[propName];
            delete observable[propName];
            observable[propName] = propValue;
        });

        return Object.create({
            destroy() {
                if (inst.watched[propName]){
                    inst.watched[propName].destroy(true);
                }
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
export function observableAssign(observable, ...objs) {
    if (objs.length) {
        arrayForEach(objs, obj => {
            arrayForEach(objectKeys(obj), key => {
                makePropWatchable(observable, key);
                observable[key] = obj[key];
            });
        });
    }
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
export function makeObservable(observable, propName, deep, onEach) {
    if (observable) {
        if (propName) {
            makePropWatchable(observable, propName);
        }
        else {
            arrayForEach(objectKeys(observable), prop => makePropWatchable(observable, prop));
        }

        if (deep) {
            arrayForEach(objectKeys(observable), key => {
                if (observable[key] && isPureObject(observable[key])) {
                    makeObservable(observable[key], null, deep, onEach);
                }

                if (onEach) {
                    onEach(observable[key]);
                }
            });
        }
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
export function watchProp(observable, propName, notifier) {
    const inst = getInstance(observable);

    if (propName === observable) {
        return inst.on(inst, notifier);
    }
    else if (objectHasOwnProperty(observable, propName)){
        makePropWatchable(observable, propName);
        return inst.on(propName, notifier);
    }
    else {
        return noopEventListener;
    }
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
export function watchPropOnce(observable, propName, notifier) {
    const inst = getInstance(observable);

    if (propName === observable) {
        return inst.once(inst, notifier);
    }
    else if (objectHasOwnProperty(observable, propName)){
        makePropWatchable(observable, propName);
        return inst.once(propName, notifier);
    }
    else {
        return noopEventListener;
    }
}

/**
 * Stop watching an object property.
 *
 * @param {Object} observable
 * @param {String} propName
 * @param {Function} notifier
 */
export function unwatchProp(observable, propName, notifier) {
    return getInstance(observable).off(propName, notifier);
}


/**
 * Notifies watchers of a given Observable property
 *
 * @param {Object} observable
 * @param {String} propName
 */
export function notifyPropWatchers(observable, propName) {
    let watched = getInstance(observable).watched;
    if (watched[propName]) {
        watched[propName].notify(true);
    }
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
export function observableMixin(observable) {
    if (observable) {
        arrayForEach(objectKeys(ObservableObject.prototype), function(method){
            if (!(method in observable) || observable[method] !== ObservableObject.prototype[method]) {
                objectDefineProperty(observable, method, {
                    value:          ObservableObject.prototype[method],
                    enumerable:     false,
                    configurable:   true
                });
            }
        });
    }
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
    watchAll:   true,
    deep:       true
};

export default ObservableObject;
export {
    setDependencyTracker,
    unsetDependencyTracker,
    stopDependeeNotifications
};