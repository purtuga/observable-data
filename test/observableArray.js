require             = require('@std/esm')(module, { cjs: true, esm: 'js' });
const test          = require("tape");
const {
    default:ObservableArray,
    mixin }    = require("../src/ObservableArray");

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
        let data    = ObservableArray.create(["one", "two", "tree", "four", "five", "six", "seven"]);
        let cb      = getCallback();
        let count   = 0;

        data.on("change", cb);

        // Remove mutating methods
        ['pop', 'shift',].forEach((mutatingMethod, index) => {
            data[mutatingMethod]();
            count++;
            st.equal(cb.callCount, count, `triggers change on ${ mutatingMethod }()`);

        });

        // Add mutating methods
        ['push', 'unshift'].forEach((mutatingMethod, index) => {
            data[mutatingMethod](`test ${ index }`);
            count++
            st.equal(cb.callCount, count, `triggers change on ${ mutatingMethod }()`);
        });

        data.splice(0,0,"splice item");
        count++;
        st.equal(cb.callCount, count, "triggers change on splice()");

        st.end();
    });

    t.test("New collection are returned", st => {
        const data = ObservableArray.create([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        let resp;

        resp = data.filter(item => item < 3);
        st.ok(Array.isArray(resp), ".filter() return array");
        st.equal(resp.length, 2, ".filter()'d array has 2 element");
        st.equal(typeof resp.on, "function", ".filter() returned ObservableArray");

        resp.destroy();
        resp = data.concat([10, 11]);
        st.equal(typeof resp.on, "function", ".concat() returned ObservableArray");
        st.equal(resp.length, 11, ".concat() array has 11 items");

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

    t.end();
});
