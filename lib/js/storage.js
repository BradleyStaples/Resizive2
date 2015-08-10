/* global window, localStorage */

'use strict';

(function () {

    // coerce integers back to boolean from strings
    var coerceInteger = function (value) {
        return parseInt(value, 10);
    };

    // coerce strings back to boolean from strings
    var coerceBoolean = function (value) {
        return value === 'true';
    };

    // methods to coerce values from strings back into sane values
    var coerceValues = {
        animation_increment: coerceInteger,
        animation_duration: coerceInteger,
        step_increment: coerceInteger,
        step_duration: coerceInteger,
        scrollbars: coerceBoolean,
        rulers: coerceBoolean,
        snap: coerceBoolean
    };

    var getValue = function (key) {
        var base = this.BASE_VALUES;
        var value = localStorage.getItem(key) ? localStorage.getItem(key) : base[key];
        return coerceValues[key](value);
    };

    // constructor function
    var ResiziveStorage = function (keyboard_events, key_map) {
        this.defineBaseValues();
    };

    ResiziveStorage.prototype.defineBaseValues = function () {
        this.BASE_VALUES = {
            animation_increment: 35,
            animation_duration: 100,
            step_increment: 10,
            step_duration: 100,
            scrollbars: true,
            rulers: true,
            snap: false
        };
    };

    // usage:
    // getValues() - gets all local storage values as object map
    ResiziveStorage.prototype.getValues = function () {
        var keys = Object.keys(this.BASE_VALUES);

        // get each value in an object, and return the entire object
        var values = {};
        keys.forEach(function (key) {
            values[key] = getValue.call(this, key);
        }.bind(this));
        return values;
    };

    // usage: setValues(map)
    // map: a dictionary object mapping keys to values
    //      example: {increment: 10, snap: true}
    ResiziveStorage.prototype.setValues = function (map) {
        // go through each value in the map and save to localStorage
        Object.keys(map).forEach(function (key) {
            var value = map[key];
            localStorage.setItem(key, value);
        });
    };

    window.ResiziveStorage = ResiziveStorage;
}());
