# observable-data

>   DEPRECATED
>   This module is deprecated and will not be maintained. Use https://github.com/purtuga/observables instead.










______



Enable the ability for Arrays and Objects to emit events and for listeners to be attached to those data structures. Use it to create reactive interfaces or trigger logic when data changes. `ObservableObjects` also have the ability for Computed properties to be created on objects.

Source: [github.com/purtuga/observable-data](https://github.com/purtuga/observable-data)

## Installation

```
$ npm install purtuga/observable-data --save-dev
```

## ObservableObject

Observable Objects are normal JavaScript Objects whose properties can be "watched" for changes. 

```
import { ObservableObject } from "observable-data"

const user = ObservableObject.create({
    firstName: "Paul", 
    lastName: "Tavares" 
});

const firstNameEvListener = user.on("firstName", () => console.log(`firstName attribute changed to: ${ user.firstName }`));

user.firstName = "Jack"; // console: firstName attribute changed to: Jack"

// Stop listening to event
firstNameEvListener.off();
```

To get notified of all changes to the object, use the object instance as input to the `on` method:

```
user.on(user, () => console.log("something changed!"));
```

### ObservableObject - Computed Properties

Computed properties allow you to create Object properties whose value is generated via a callback function. If that callback function, in its logic, uses properties from __any__ observable property, then it will trigger an event for the object property and cause the value to be regenerated the next time it is accessed. Computed properties, like other observable object properties, can be watched for changes.


```
import { ObservableObject } from "observable-data"

const user = ObservableObject.create({
    firstName: "Paul", 
    lastName: "Tavares" 
});

// Create `fullName` computed property
const fullNameComputed = ObservableObject.createComputed(user, "fullName", () => `${ user.firstName } ${ user.lastname }`);

console.log(user.fullName); // Console: Paul Tavares

user.firstName = "Jack";
console.log(user.fullName); // Console: Jack Tavares

// Destroy the computed property
fullNameComputed.destroy();
```


## ObservableArray

Observable Arrays are regular JavaScript arrays that emit events when changes occur. 

```
import { ObservableArray } from "observable-data"

const users = ObservableArray.create();
const changeEvListener = users.on("change", () => console.log(`users changed. Length: ${ users.length }`));

users.push("Paul", "Jack"); // Console: users changed. Length: 2

// Stop listening for changes
changeEvListener.off();
```

### Array Methods that Return Arrays

Array methods that return arrays as the result of calling such methods will include a method on the result called `toObservable` which allow for quick conversion of array to observable. 

Example:

```javascript
const arr = ObservableArray.create([1, 2, 3]);

const filtered = arr.filter(n => n > 2); // filtered === [3]
filtered.toObservable(); // makes filtered observable as well

```


## License

MIT License