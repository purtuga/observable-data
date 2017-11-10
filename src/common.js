import EventEmitter     from "common-micro-libs/src/jsutils/EventEmitter"
import nextTick         from "common-micro-libs/src/jsutils/nextTick"
import dataStore        from "common-micro-libs/src/jsutils/dataStore"

//=======================================================================
export const PRIVATE                        = dataStore.create();
export const INTERNAL_EVENTS                = EventEmitter.create();
export const EV_STOP_DEPENDEE_NOTIFICATION  = "1";
export const ARRAY_PROTOTYPE                = Array.prototype;
export const IS_COMPUTED_NOTIFIER           = "__od_cn__";
export const OBJECT_PROTOTYPE               = Object.prototype;

export const bindCallTo         = Function.call.bind.bind(Function.call);
export const dependeeList       = [];
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
    if (dependeeNotifier && arrayIndexOf(dependeeList, dependeeNotifier) === -1) {
        dependeeList.push(dependeeNotifier);
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
    const index = arrayIndexOf(dependeeList, dependeeNotifier);
    if (index !== -1) {
        arraySplice(dependeeList, index, 1);
    }
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
    const dependeeNotifiers = [];
    const execNotifiers     = () => arrayForEach(arraySplice(dependeeNotifiers, 0), notifierCb => notifierCb());

    return notifierCb => {
        if (!notifierCb || arrayIndexOf(dependeeNotifiers, notifierCb) !== -1) {
            return;
        }

        // Computed property notifiers are lightweight, so execute
        // these now and don't queue them.
        if (notifierCb[IS_COMPUTED_NOTIFIER]) {
            notifierCb();
            return;
        }

        const callNextTick = !dependeeNotifiers.length;
        dependeeNotifiers.push(notifierCb);

        if (callNextTick) {
            nextTick(execNotifiers);
        }
    };
})();


export function storeDependeeNotifiers (store) {
    if (store && dependeeList.length) {
        arrayForEach(dependeeList, dependeeCallback => {
            store.add(dependeeCallback);
        });

    }
}
