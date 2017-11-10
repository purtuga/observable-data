import EventEmitter     from "common-micro-libs/src/jsutils/EventEmitter"
import nextTick         from "common-micro-libs/src/jsutils/nextTick"
import dataStore        from "common-micro-libs/src/jsutils/dataStore"
import Set              from "common-micro-libs/src/jsutils/es6-Set"

//=======================================================================
export const PRIVATE                        = dataStore.create();
export const INTERNAL_EVENTS                = EventEmitter.create();
export const EV_STOP_DEPENDEE_NOTIFICATION  = "1";
export const ARRAY_PROTOTYPE                = Array.prototype;
export const IS_COMPUTED_NOTIFIER           = "__od_cn__";
export const OBJECT_PROTOTYPE               = Object.prototype;

export const bindCallTo         = Function.call.bind.bind(Function.call);
export const dependeeList       = new Set();
export const onInternalEvent    = INTERNAL_EVENTS.on.bind(INTERNAL_EVENTS);
export const emitInternalEvent  = INTERNAL_EVENTS.emit.bind(INTERNAL_EVENTS);
export const isArray            = Array.isArray;
export const arrayIndexOf       = bindCallTo(ARRAY_PROTOTYPE.indexOf);
export const arraySplice        = bindCallTo(ARRAY_PROTOTYPE.splice);
export const arrayForEach       = bindCallTo(ARRAY_PROTOTYPE.forEach);
export const isPureObject       = o => o && OBJECT_PROTOTYPE.toString.call(o) === "[object Object]";

/**
 * Allows for adding a Dependee notifier to the global list of dependency trackers.
 *
 * @param {Function} dependeeNotifier
 */
export function setDependencyTracker(dependeeNotifier) {
    if (dependeeNotifier) {
        dependeeList.add(dependeeNotifier);
    }
}

/**
 * Removes a Dependee notifier from the global list of dependency trackers.
 *
 * @param {Function} dependeeNotifier
 */
export function unsetDependencyTracker(dependeeNotifier) {
    if (!dependeeNotifier) {
        return;
    }
    dependeeList.delete(dependeeNotifier);
}

/**
 * Removes a Dependee notifier from any stored ObservableProperty list of dependees, thus
 * stopping all notifications to that depenedee.
 *
 * @param {Function} dependeeNotifier
 */
export function stopDependeeNotifications(dependeeNotifier) {
    if (dependeeNotifier) {
        emitInternalEvent(EV_STOP_DEPENDEE_NOTIFICATION, dependeeNotifier);
    }
}


export const queueDependeeNotifier = (() => {
    const dependeeNotifiers = new Set();
    const execNotifiers     = () => {
        for (let notifierCb of dependeeNotifiers) {
            notifierCb();
        }
        dependeeNotifiers.clear();
    };

    return notifierCb => {
        // Computed property notifiers are lightweight, so execute
        // these now and don't queue them.
        if (notifierCb[IS_COMPUTED_NOTIFIER]) {
            notifierCb();
            return;
        }

        if (!notifierCb || dependeeNotifiers.has(notifierCb)) {
            return;
        }

        const callNextTick = !dependeeNotifiers.size;
        dependeeNotifiers.add(notifierCb);

        if (callNextTick) {
            nextTick(execNotifiers);
        }
    };
})();


export function storeDependeeNotifiers (store) {
    if (store && dependeeList.size) {
        for (let dependeeCallback of dependeeList) {
            store.add(dependeeCallback);
        }
    }
}
