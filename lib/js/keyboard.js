/* global window, document */

(function () {
    'use strict';

    // define which keyboard events are listened to
    var defineSupportedEvents = function (events) {
        var default_events = ['keydown', 'keyup', 'keypress'];

        // if no events were passed in, use defaults
        if (!events) {
            events = default_events;
        }

        // if a single event was passed in but not as an
        // array, convert to array
        if (events instanceof Array === false) {
            events = [events];
        }

        this.constructor.prototype.default_keyboard_event = 'keydown';
        this.constructor.prototype.supported_events = events;
    };

    var defineHandlerMaps = function () {
        // create a map to store handlers via key,
        // a unique map per keyboard_event type supported
        // will be referenced later by keys. example:
        // this.handlers.keypress = {'up': upHandler}
        this.constructor.prototype.handlers = {};
        this.supported_events.forEach(function (keyboard_event) {
            this.handlers[keyboard_event] = {};
        }.bind(this));
    };

    // define the keys we are listening for
    var defineKeys = function (key_map) {
        var default_keys = {
            left: 37,
            up: 38,
            right: 39,
            down: 40,
            p: 80,
            r: 82,
            s: 83,
            '+': 107,
            '-': 109,
            '?': 191
        };

        var keys;
        if (!key_map) {
            // if no key map was passed in, use defaults
            keys = default_keys;
        } else {
            // we want to listen for both defaults as well as
            // any keys also passed in. in case a passed in key
            // has same code but different value, prefer version
            // from arguments
            keys = default_keys.slice();
            Object.keys(key_map).forEach(function (mapped_key) {
                keys[mapped_key] = key_map[mapped_key];
            });
        }

        this.constructor.prototype.keys = keys;
    };

    // create a reverse map of codes-to-keys
    var defineCodes = function () {
        this.constructor.prototype.codes = {};
        Object.keys(this.keys).forEach(function (key) {
            var code = this.keys[key];
            this.codes[code] = key;
        }.bind(this));
    };

    var isKeyboardEventValid = function (keyboard_event) {
        // if key was bound to an event that is not listening to,
        // throw an error
        if (this.supported_events.indexOf(keyboard_event) === -1) {
            var err = 'unsupported keyboard event ' + keyboard_event;
            err += '. Only listening to: ';
            err += this.supported_events.join(', ');
            console.error(err);
            return false;
        }
        return true;
    };

    // return true if all keys are valid, false if any are not
    // to_do: support keys that are valid while filtering
    //        out those that aren't
    var areKeysValid = function (keys) {
        var number_keys = keys.length;
        var valid_keys = 0;
        keys.forEach(function (key) {
            if (this.keys.hasOwnProperty(key)) {
                valid_keys++;
            }
        }.bind(this));
        return number_keys === valid_keys;
    };

    // return a handler if it exists, false if not
    var doesHandlerExist = function (keyboard_event, key) {
        // if this keyboard_event isn't supported, no handler
        if (!this.handlers.hasOwnProperty(keyboard_event)) {
            return false;
        }
        // if this key isn't mapped to a handler for this
        // keyboard_event, no handler
        if (!this.handlers[keyboard_event].hasOwnProperty(key)) {
            return false;
        }
        return this.handlers[keyboard_event][key];
    };

    // wrap handlers with some checks to call before invoking;
    // returns false in scenarios meant to prevent invoking handler
    var handlerWrapper = function (keyboard_event, key, handler, event) {
        // if user is typing into a form field, do not listen to events
        var tag = event.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea') {
            return false;
        }

        // don't let metaKeys (shift, alt, control, command, windows)
        // be used in conditon with other keys that are being listened for
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return false;
        }


        // if this key is not on the list of potential ones to listen to,
        // no handler could exist, so return false
        if (!this.keys.hasOwnProperty(key)) {
            return false;
        }

        // assign handler
        this.handlers[keyboard_event][key] = handler;

        return handler();
    };

    // register a handler for a given keyboard_event and key
    var register = function (keyboard_event, key, handler) {
        var listener = handlerWrapper.bind(this, keyboard_event, key, handler);
        if (listener) {
            document.body.addEventListener(keyboard_event, listener, false);
        }
    };

    // delete a handler and stop listening for the related events
    var unregister = function (keyboard_event, key) {
        var listener = handlerWrapper.bind(this, keyboard_event);
        if (listener) {
            document.body.removeEventListener(keyboard_event, listener, false);
            delete this.handlers[keyboard_event][key];
        }
    };

    // constructor function
    var Keyboard = function (keyboard_events, key_map) {
        defineSupportedEvents.call(this, keyboard_events);
        defineHandlerMaps.call(this);
        defineKeys.call(this, key_map);
        defineCodes.call(this);
    };


    // keyboard_event: a string or the keyboard event type.
    //      if ommitted, defaults to 'keydown'
    // keys: may be single string or array of strings
    // handler: handler function to be fired when keyboard_event for given key(s)
    //      fires. is passed the arguments: (event, keyboard_event, key)
    // returns true if listening to keys, false if not
    // example usages:
    // bindKeys(['up', 'down'], 'keydown', keyDownHandler);
    // bindKeys('up', 'keydown', keyDownHandler);
    // bindKeys('up', keyDownHandler);
    Keyboard.prototype.bindKeys = function (keyboard_event, keys, handler) {
        // if keyboard_event was omited, default keyboard_event to keydown
        // and normalize arguments as if keyboard_event was passed in
        if (typeof keys === 'function') {
            handler = keys;
            keys = keyboard_event;
            keyboard_event = this.default_keyboard_event;
        }

        // if keys was passed in as string, convert to array of one element
        if (keys.constructor !== Array) {
            keys = [keys];
        }

        // if any of the keys aren't handled, bail on listening
        // to_do: filter out any unsupported keys, and support
        // the remainder
        if (!areKeysValid.call(this, keys)) {
            return false;
        }

        // if keyboard_event isn't supported, bail on listening
        if (!isKeyboardEventValid.call(this, keyboard_event)) {
            return false;
        }

        // keys are valid, keyboard_events are valid, setuop listeners
        // go through each key
        keys.forEach(function (key) {
            // check that we aren't already listening to this key;
            // do not want a listener on more than one keyboard_event
            if (!doesHandlerExist.call(this, keyboard_event, key)) {
                // if no listener exists, register a new one for the handler
                register.call(this, keyboard_event, key, handler);
            }
        }.bind(this));

        return true;
    };

    // unbind all listeners for a given keyboard_event
    Keyboard.prototype.unbindKeyboardEvent = function (keyboard_event) {
        // if keyboard_event isn't supported, nothing to unbind
        if (!isKeyboardEventValid.call(this, keyboard_event)) {
            return false;
        }

        this.keys.forEach(function (key) {
            this.unbind(keyboard_event, key);
        }.bind(this));
    };

    // unbind a specific keyboard_event and key combo
    Keyboard.prototype.unbind = function (keyboard_event, key) {
        // if key isn't supported, nothing to unbind
        if (!this.keys.hasOwnProperty(key)) {
            return;
        }
        // if keyboard_event isn't supported, nothing to unbind
        if (!isKeyboardEventValid.call(this, keyboard_event)) {
            return;
        }
        // if no handler exists, nothing to unbind
        if (!doesHandlerExist.call(this, keyboard_event, key)) {
            return;
        }
        // unregister the handler and listener
        return unregister.call(this, keyboard_event, key);
    };

    // unbinding all keyboard_events, which means all handlers
    Keyboard.prototype.unbindAll = function () {
        this.supported_events.forEach(function (keyboard_event) {
            this.unbindKeyboardEvent(keyboard_event);
        }.bind(this));
    };

    window.Keyboard = new Keyboard();
}());
