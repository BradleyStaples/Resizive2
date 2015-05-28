'use strict';

var resiziveStorage = {
    _INITIAL_VALUES: {
        increment: 50,
        speed: 50,
        scrollbars: true,
        rulers: true,
        snap: false
    },
    _COERCIONS: {
        // localStorage coerces to strings, so force them back to sane values
        increment: function (val) {
            return parseInt(val, 10);
        },
        speed: function (val) {
            return parseInt(val, 10);
        },
        scrollbars: function (val) {
            return val === 'true';
        },
        rulers: function (val) {
            return val === 'true';
        },
        snap: function (val) {
            return val === 'true';
        }
    },
    _getValue: function (key) {
        var base = resiziveStorage._INITIAL_VALUES;
        var val = localStorage.getItem(key) ? localStorage.getItem(key) : base[key];
        return resiziveStorage._COERCIONS[key](val);
    },
    // usage:
    // getValues() - gets *all* values as object map
    getValues: function () {
        var keys = Object.keys(resiziveStorage._INITIAL_VALUES);

        // return the values as an object
        var values = {};
        keys.forEach(function (key) {
            values[key] = resiziveStorage._getValue(key);
        });
        return values;
    },
    // expects a dictionary object mapping keys to values:
    // example: {increment: 10, snap: true}
    setValues: function (map) {
        Object.keys(map).forEach(function (key) {
            var value = map[key];
            localStorage.setItem(key, value);
        });
    }
};

