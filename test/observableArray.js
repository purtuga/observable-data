require             = require('@std/esm')(module, { cjs: true, esm: 'js' });
const test          = require("tape");
const {
    default:ObservableArray,
    mixin,
    setDependencyTracker,
    unsetDependencyTracker,
    stopDependeeNotifications } = require("../src/ObservableArray");
const delay                     = ms => new Promise(resolve => setTimeout(resolve, ms || 2));

test("ObservableArray", t => {
    const getCallback = () => {
        const cb = () => {
            cb.callCount++;
        };
        cb.callCount = 0;
        return cb;
    };

    t.equal(typeof ObservableArray, "function", "is Defined");
    t.equal(typeof ObservableArray.create, "function", "has .create() static method");

    // ARRAY LIKE
    t.test("Contains proxied Array Methods", st => {
        const data = ObservableArray.create();

        t.ok(Array.isArray(data), "is instance array");

        // Has all methods
        Object.getOwnPropertyNames(Array.prototype).forEach(arrayMethod => {
            if (arrayMethod === "constructor" || typeof Array.prototype[arrayMethod] !== "function") {
                return;
            }
            st.equal(typeof data[arrayMethod], "function", `has ${ arrayMethod } instance method`);
        });

        const data1 = [];
        const push = () => {push.count = push.count || 0;  push.count++};
        data1.push = push;

        // ObservableArray.create() should change array passed on input
        ObservableArray.create(data1);

        data1.push("hello");
        t.equal(push.count, 1, "original array method is called");

        st.end();
    });

    // LENGTH
    t.test("Length property returns Array length value", st => {
        let data = ObservableArray.create();
        st.notOk(data.length, "has length 0 when initialized with no input");
        data.destroy();

        data = ObservableArray.create(["one", "two"]);
        st.equal(data.length, 2, "has length is 2 when initialized with array(2)");

        data.push("tree");
        st.equal(data.length, 3, "has length 3 when item is pushed");

        data.pop();
        st.equal(data.length, 2, "has length 2 when item is pop'd");

        st.equal(data.length, data.size(), "size prop equals length prop");

        st.equal(data.len, data.size(), "len property is same as size()");

        st.end();
    });

    // EVENTS
    t.test("Emits events", st => {
        st.plan(7)

        let data    = ObservableArray.create(["one", "two", "tree", "four", "five", "six", "seven"]);
        let cb      = getCallback();
        let count   = 0;

        data.on("change", cb);

        // Test each mutating method
        [
            'pop',
            'push',
            'shift',
            'splice',
            'unshift',
            'sort',
            'reverse'
        ].reduce((whenLastTestDone, mutatingMethod) => {
            return whenLastTestDone.then(() => {
                data[mutatingMethod]();
                count++;
                const nowCount = count;

                return delay().then(() => {
                    st.equal(cb.callCount, nowCount, `triggers change on ${ mutatingMethod }()`);
                });
            });
        }, Promise.resolve());


    });

    t.test("methods return collection instances", st => {
        const data = ObservableArray.create([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        let resp;

        resp = data.filter(item => item < 3);
        st.ok(Array.isArray(resp), ".filter() return array");
        st.equal(resp.length, 2, ".filter()'d array has 2 element");
        st.equal(typeof resp.on, "undefined", ".filter() returns non-ObservableArray");
        st.equal(typeof resp.toObservable, "function", ".filter() returns array with toObservable() method");

        // resp.destroy();
        resp = data.concat([10, 11]);
        st.equal(resp.length, 11, ".concat() array has 11 items");
        st.equal(typeof resp.on, "undefined", ".concat() returned non-observable");
        let resp2 = resp.toObservable();
        st.equal(typeof resp.on, "function", "toObservable() converts array to observable");
        st.equal(resp, resp2, "toObservable() does in-place convert to observable");

        resp.destroy();
        resp = data.reverse();
        st.ok(resp === data, ".reverse() return original array (mutated)");

        st.end()
    });

    t.test("mixin", st => {
        let arr = origArr = [1];
        mixin(arr);

        st.equal(arr, origArr, "array remains intact");
        st.equal(typeof arr.on, "function", "has on() method");
        st.equal(typeof arr.emit, "function", "has emit() method");

        st.end();
    });

    t.test("Dependee notifications", st => {
        st.plan(5);
        const dependeeNotifier = () => { dependeeNotifier.count = dependeeNotifier.count || 0; dependeeNotifier.count++};
        const data = ObservableArray.create(["1", "2"]);

        setDependencyTracker(dependeeNotifier);
        data.len;
        unsetDependencyTracker(dependeeNotifier);

        data.push("3");
        delay()
            .then(() => {
                st.equal(dependeeNotifier.count, 1, "calls dependeeNotifier with .push()");

                data.pop();
                return delay();
            })
            .then(() => {
                st.equal(dependeeNotifier.count, 2, "calls dependeeNotifier with .pop()");

                data.sort();
                return delay();
            })
            .then(() => {
                st.equal(dependeeNotifier.count, 3, "calls dependeeNotifier with .sort()");

                // 3 updates calls dependee only once
                data.item(0, "one");
                data.push("one", "two");
                data.pop("three", "four");
                return delay();
            })
            .then(() => {
                st.equal(dependeeNotifier.count, 4, "calls dependeeNotifier with .item()");

                stopDependeeNotifications(dependeeNotifier);
                data.push("another");
                return delay();
            })
            .then(() => {
                st.equal(dependeeNotifier.count, 4, "stops calling dependeeNotifier");
            })
            .catch(console.error.bind(console));
    });

    t.end();
});
