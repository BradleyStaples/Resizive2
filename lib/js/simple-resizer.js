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
        direction: null
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
    var can_adjust_vertical = movement === 'vertical' && allowed === movement;
    var can_adjust_horizontal = movement === 'horizontal' && allowed === movement;
    return can_adjust_vertical || can_adjust_horizontal;
};

SimpleResizer.prototype.adjustHeight = function () {
    var $element = $(this.config.element);
    var height_difference = this.adjustments.y - this.starting.mouse_y;
    var new_height = this.starting.height + height_difference;
    $element.height(new_height);
};

SimpleResizer.prototype.adjustWidth = function () {
    var $element = $(this.config.element);
    var width_difference = this.adjustments.x - this.starting.mouse_x;
    var new_width = this.starting.width + width_difference;
    $element.width(new_width);
};

SimpleResizer.prototype.adjustSize = function () {
    if (this.canAdjust('vertical')) {
        this.adjustHeight();
    }
    if (this.canAdjust('horizontal')) {
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
    if (this.canAdjust('vertical')) {
        this.moveHandleVertically();
    } else {
        // make sure handle stays centered vertically if a
        // separate handle allows for movement
        this.moveHandleVertically(true);
    }
    if (this.canAdjust('horizontal')) {
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

    // bind these to document to allow slight movement of mouse off of handle
    var $doc = $(window.document);
    $doc.on('mousemove', this.onMouseMove.bind(this));
    $doc.on('mouseup', this.onMouseUp.bind(this));
    return false;
};

SimpleResizer.prototype.onMouseMove = function (event) {
    event.preventDefault();
    this.setAdjustments(event.pageX, event.pageY);
    this.adjustSize();
    this.moveHandle();
    return false;
};

SimpleResizer.prototype.onMouseUp = function (event) {
    event.preventDefault();
    var $doc = $(window.document);
    $doc.off('mousemove', this.onMouseMove.bind(this));
    $doc.off('mouseup', this.onMouseUp.bind(this));

    // clear out previous values
    this.setStarting();
    this.setAdjustments();
    return false;
};
