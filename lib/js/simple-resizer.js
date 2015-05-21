/* global window, $ */
'use strict';

var SimpleResizer = function (options) {
    this.setDefaults(options);
    this.setStarting();
    this.bindMouseDown();
};

// direction can be 'vertical', 'horizontal', or 'both'
SimpleResizer.prototype.setDefaults = function (options) {
    var defaults = {
        handle: null,
        element: null,
        direction: null,
        dir_h: 'horizontal',
        dir_v: 'vertical',
        bounds_h: {
            min: 0,
            max: $(window).width()
        },
        bounds_v: {
            min: 0,
            max: $(window).height()
        }
    };

    var config = $.extend(defaults, options);
    this.config = config;
};

SimpleResizer.prototype.setStarting = function (x, y) {
    var $element = $(this.config.element);

    this.starting = {
        width: $element.width(),
        height: $element.height(),
        mouse_x: x || 0,
        mouse_y: y || 0
    };
};

SimpleResizer.prototype.setAdjustments = function (x, y) {
    this.adjustments = {
        x: x || 0,
        y: y || 0
    };
};

SimpleResizer.prototype.canAdjust = function (movement) {
    var allowed = this.config.direction;
    if (allowed === 'both') {
        return true;
    }
    var can_adjust_vertical = movement === this.config.dir_v && allowed === movement;
    var can_adjust_horizontal = movement === this.config.dir_h && allowed === movement;
    return can_adjust_vertical || can_adjust_horizontal;
};

SimpleResizer.prototype.keepInBounds = function (amount, direction) {
    if (direction === this.config.dir_h) {
        return Math.min(Math.max(amount, this.config.bounds_h.min), this.config.bounds_h.max);
    }
    return Math.min(Math.max(amount, this.config.bounds_v.min), this.config.bounds_v.max);
};

SimpleResizer.prototype.adjustHeight = function () {
    var $element = $(this.config.element);
    var height_difference = this.adjustments.y - this.starting.mouse_y;
    var new_height = this.starting.height + height_difference;
    new_height = this.keepInBounds(new_height, this.config.dir_v);
    $element.height(new_height);
};

SimpleResizer.prototype.adjustWidth = function () {
    var $element = $(this.config.element);
    var width_difference = this.adjustments.x - this.starting.mouse_x;
    var new_width = this.starting.width + width_difference;
    new_width = this.keepInBounds(new_width, this.config.dir_h);
    $element.width(new_width);
};

SimpleResizer.prototype.adjustSize = function () {
    if (this.canAdjust(this.config.dir_v)) {
        this.adjustHeight();
    }
    if (this.canAdjust(this.config.dir_h)) {
        this.adjustWidth();
    }
};

SimpleResizer.prototype.moveHandleVertically = function (center) {
    var $handle = $(this.config.handle);
    var top = this.adjustments.y;
    if (center) {
        top = '50%';
    }

    $handle.css({
        bottom: 0,
        top: top
    });
};

SimpleResizer.prototype.moveHandleHorizontally = function (center) {
    var $handle = $(this.config.handle);
    var left = this.adjustments.x;
    if (center) {
        left = '50%';
    }

    $handle.css({
        right: 0,
        left: left
    });
};

SimpleResizer.prototype.moveHandle = function () {
    if (this.canAdjust(this.config.dir_v)) {
        this.moveHandleVertically();
    } else {
        // make sure handle stays centered vertically if a
        // separate handle allows for movement
        this.moveHandleVertically(true);
    }
    if (this.canAdjust(this.config.dir_h)) {
        this.moveHandleHorizontally();
    } else {
        // make sure handle stays centered horizontally if a
        // separate handle allows for movement
        this.moveHandleHorizontally(true);
    }
};

SimpleResizer.prototype.bindMouseDown = function () {
    var $handle = $(this.config.handle);
    $handle.on('mousedown', this.onMouseDown.bind(this));
};

SimpleResizer.prototype.onMouseDown = function (event) {
    event.preventDefault();
    this.setStarting(event.pageX, event.pageY);
    console.log('we have mouse touchdown');

    // bind mouseup to <body> as it can occur on a different dom element
    var $body = $('body');
    $(this.config.handle).on('mousemove', this.onMouseMove.bind(this));
    $body.one('mouseup', this.onMouseUp.bind(this));
    return false;
};

SimpleResizer.prototype.onMouseMove = function (event) {
    event.preventDefault();
    console.log('mouse be moving yo', event.pageX, event.pageY);
    this.setAdjustments(event.pageX, event.pageY);
    this.adjustSize();
    this.moveHandle();
    return false;
};

SimpleResizer.prototype.onMouseUp = function (event) {
    event.preventDefault();
    console.log('about to unbind mouse events');
    $(this.config.handle).off('mousemove');

    // clear out previous values
    this.setStarting();
    this.setAdjustments();
    return false;
};
