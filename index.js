import ObservableArray, { mixin }           from "./src/ObservableArray"
import ObservableObject, { makeObservable } from "./src/ObservableObject"
import {
    isPureObject,
    arrayForEach,
    isArray }  from "./src/common"

//==================================================================

/**
 * Observes all data - object and arrays - given on input.
 *
 * @param {...Object|...Array} data
 */
export function observeAll(...data) {
    arrayForEach(data, dataItem => {
        if (isPureObject(dataItem)) {
            makeObservable(dataItem, null, true, propValue => {
                if (propValue && isArray(propValue)) {
                    observeAll(propValue);
                }
            });
        }
        else if (isArray(dataItem)) {
            mixin(dataItem);
            observeAll(...dataItem);
        }
    });
}

export { ObservableArray, ObservableObject };
