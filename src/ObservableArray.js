import EventEmitter from "common-micro-libs/src/jsutils/EventEmitter"

//==============================================================
const ArrayPrototype    = Array.prototype;
const isArray           = Array.isArray;
const objectDefineProp  = Object.defineProperty;
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
let ObservableArray = /** @lends ObservableArray.prototype */{
    init: function(initialValues){
        if (isArray(initialValues)) {
            this.push(...initialValues);
        }
    },

    /**
     * The size of the collection. Same as `array#length`
     *
     * @type Number
     */
    size: function(){
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

        // GET mode..
        if (args.length === 1) {
            return _array[index];
        }

        // Update mode... Emits event
        let updateResponse = _array[index] = args[1];
        _array.emit("change", updateResponse);

        return updateResponse;
    }
};

// Add all methods of Array.prototype to the collection
Object.getOwnPropertyNames(ArrayPrototype).forEach(function(method){
    if (method === "constructor" || typeof ArrayPrototype[method] !== "function") {
        return;
    }

    var doEvents = changeMethods.indexOf(method) !== -1;

    ObservableArray[method] = function(){
        var response = ArrayPrototype[method].apply(this, arguments);

        // If the response is an array and its not this instance, then
        // ensure it is an instance of this ObservableArray
        if (isArray(response) && response !== this) {
            response = this.getFactory().create(response);
        }

        // If Array method can manipulate the array, then emit event
        if (doEvents) {
            /**
             * ObservableArray was changed. Event will provide the value returned
             * by the Array method that made the change.
             *
             * @event ObservableArray#change
             * @type {*}
             *
             */
            this.emit("change", response);
        }

        return response;
    }
});

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

    const observableArrayPrototype = ObservableArray.prototype;

    // If it looks like it is already an observable, then exit
    if (arr.push === observableArrayPrototype.push) {
        return arr;
    }

    // FIXME: would use of Object.setPrototypeOf or setting [].__proto__ be better? Need to investigate
    for (let prop in observableArrayPrototype){
        /* eslint-disable */
        objectDefineProp(arr, prop, {
            value:          observableArrayPrototype[prop],
            writable:       true,
            configurable:   true
        });
        /* eslint-enable */
    }
    return arr;
}


ObservableArray = EventEmitter.extend(ObservableArray);

// Define the "create" factory method that will then redefine each
// our proxyied methods of Array prototype into the array instance
objectDefineProp(ObservableArray, "create", {
    value: function(){
        let instance        = [];
        let thisPrototype   = this.prototype;

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
