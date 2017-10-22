require             = require('@std/esm')(module, { cjs: true, esm: 'js' });
const test          = require("tape");
const observeAll    = require("../index").observeAll;
const { createComputedProp } = require("../src/ObservableObject");

const getCallback = () => {
    const cb = () => {
        cb.callCount++;
    };
    cb.callCount = 0;
    return cb;
};

test("observeAll", t => {
    const data1 = {
        arr: [
            {
                key: "data1.arr[0].key",
                value: {
                    key: "data1.arr[0].value"
                },
                subArr: [ "sub1" ]
            },
            "a string",
            [
                "an",
                "array",
                [
                    "with",
                    "sub",
                    { value: "array" }
                ]
            ]
        ],
        obj: {
            key: "data1.obj.key"
        },
        arr2: [
            "one",
            { key: "two" }
        ]
    };

    observeAll(data1);

    t.equal(data1.arr[0].key, "data1.arr[0].key", "should have access to data");

    const data2 = {};
    createComputedProp(data2, "c1", () => {
        return `arr2.len: ${ data1.arr2.len } | ${ data1.arr.item(0).key }`
    });

    t.equal(data2.c1, "arr2.len: 2 | data1.arr[0].key", "calculate computed correctly");

    data1.arr2.push("3");
    t.equal(data2.c1, "arr2.len: 3 | data1.arr[0].key", "calculate computed correctly");

    data1.arr[0].key = "data1.arr[0].key1";
    t.equal(data2.c1, "arr2.len: 3 | data1.arr[0].key1", "has updated computed from obj in array");

    t.end();
});

