/* global window, document */

(function () {
    'use strict';

    var Keyboard = function () {
        this.generateCodes();
    };

    Keyboard.prototype.body = document.body;

    Keyboard.prototype.keys = {
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        e: 69,
        p: 80,
        r: 82,
        s: 83,
        '+': 107,
        '-': 109,
        '?': 191
    };

    Keyboard.prototype.codes = {};

    Keyboard.prototype.methods = ['keydown', 'keyup', 'keypress'];

    Keyboard.prototype.bindings = {
        keydown: {},
        keyup: {},
        keypress: {}
    };

    Keyboard.prototype.generateCodes = function () {
        Object.keys(this.keys).forEach(function (key) {
            this.mapCode(key, this.keys[key]);
        }.bind(this));
    };

    Keyboard.prototype.mapCode = function (key, code) {
        this.codes[code] = key;
    };

    Keyboard.prototype.mapper = function (method, event) {
        var code = event.keyCode;
        var tag = event.target.tagName.toLowerCase();

        if (tag === 'input' || tag === 'textarea') {
            return false;
        }

        if (!this.codes.hasOwnProperty(code)) {
            return false;
        }
        var key = this.codes[code];
        var func = this.bindings[method][key]();

        if (this.doesBindingExist(key, method)) {
            return func();
        }

        return true;
    };

    Keyboard.prototype.sanitizeMethod = function (method) {
        return this.methods.indexOf(method) !== -1 ? method : 'keydown';
    };

    Keyboard.prototype.sanitizeKeys = function (keys) {
        return keys.filter(function (key) {
            return this.keys.hasOwnProperty(key);
        }.bind(this));
    };

    Keyboard.prototype.doesBindingExist = function (key, method) {
        if (!this.bindings.hasOwnProperty(method)) {
            return false;
        }

        return this.bindings[method][key];
    };

    Keyboard.prototype.register = function (key, method, func) {
        this.bindings[method][key] = func;
        this.body.addEventListener(method, this.mapper.bind(this, method), false);
    };

    Keyboard.prototype.unregister = function (key, method) {
        this.body.removeEventListener(method, this.mapper.bind(this, method), false);
    };

    Keyboard.prototype.unbindMethod = function (method) {
        this.keys.forEach(function (key) {
            this.unbind(key, method);
        }.bind(this));
    };

    Keyboard.prototype.bindKeys = function (keys, method, func) {
        if (keys.constructor !== Array) {
            keys = [keys];
        }
        keys = this.sanitizeKeys(keys);
        method = this.sanitizeMethod(method);
        keys.forEach(function (key) {
            if (!this.doesBindingExist(key, method)) {
                this.register(key, method, func);
            }
        }.bind(this));
    };

    Keyboard.prototype.unbind = function (key, method) {
        if (!this.keys.hasOwnProperty(key)) {
            return;
        }
        method = this.sanitizeMethod(method);

        if (!this.doesBindingExist(key, method)) {
            return;
        }

        return this.unregister(key, method);
    };

    Keyboard.prototype.unbindAll = function () {
        this.methods.forEach(function (method) {
            this.unbindMethod(method);
        }.bind(this));
    };

    window.Keyboard = new Keyboard();
}());
