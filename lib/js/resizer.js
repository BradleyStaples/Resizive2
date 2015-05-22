/* global $, window, SimpleResizer */

'use strict';

var Resizive = function (url) {
    this.assignElements();
    this.setBindings();
    this.setKeyBindings();

    // if we have a url in the querystring, but not one via constructor,
    // it's like a page reload or bookmark. use url from querystring
    var queryUrl = this.getSiteUrlFromQueryString();
    if (queryUrl && !url) {
        url = queryUrl;
    }

    // make sure url has a protocol. it could be https, but pretend
    // it's http if user doesn't enter any protocol for now
    if (url.indexOf('://') === -1) {
        url = 'http://' + url;
    }

    this.constructor.prototype.config = this.createConfig(url);

    this.setWidthFromQueryString();

    this.elements.resizer.one('load', function () {
        this.elements.body.addClass(this.config.classResize);
        this.elements.img.addClass(this.config.classHidden);
        this.elements.resizer.removeClass(this.config.classHidden).css({
            height: $(window).height()
        });

        this.keepInBounds(false);

        // set to size according to potential querystring with 1ms animation duration
        this.animator(1);
        this.pause();
    }.bind(this));
};

Resizive.prototype.selectors = {
    startButton: '.btn-start',
    resumeButton: '.btn-resume',
    pauseButton: '.btn-pause',
    minusButton: '.btn-minus',
    plusButton: '.btn-plus',
    showWidth: '.show-width',
    container: '.resizerContainer',
    resizer: '.resizer',
    url: '.url-entry',
    img: '.loading',
    body: 'body'
};

Resizive.prototype.elements = {};

Resizive.prototype.assignElements = function () {
    Object.keys(this.selectors).forEach(function (selector) {
        this.elements[selector] = $(this.selectors[selector]);
    }.bind(this));
};

Resizive.prototype.setBindings = function () {
    $(window).on('resize', this.updateMaxWidth.bind(this));
    this.elements.body.on('click', this.selectors.startButton, this.start.bind(this));
    this.elements.body.on('click', this.selectors.pauseButton, this.pause.bind(this));
    this.elements.body.on('click', this.selectors.resumeButton, this.resume.bind(this));
    this.elements.body.on('click', this.selectors.plusButton, this.plus.bind(this));
    this.elements.body.on('click', this.selectors.minusButton, this.minus.bind(this));
    this.elements.body.on('blur', this.selectors.showWidth, this.setWidth.bind(this));
    this.elements.body.on('keydown', this.selectors.showWidth, function (event) {
        event.stopPropagation();

        if (event.which === this.config.enterKey) {
            event.preventDefault();
            this.elements.showWidth.blur();
        }
    }.bind(this));
};

Resizive.prototype.createConfig = function (url) {
    var window_width = $(window).width();
    var max_width = 2000;

    return {
        url: url,
        timer: null,
        paused: false,
        resizing: false,
        classResize: 'resizing',
        classPause: 'paused',
        classHidden: 'hidden',
        enterKey: 13,
        direction: -1,
        stepDuration: 50,
        stepIncrememnt: 10,
        animationDuration: 100,
        animationIncrement: 50,
        minWidth: 320,
        currWidth: window_width,
        maxWidth: window_width < max_width ? window_width : max_width
    };
};

Resizive.prototype.setKeyBindings = function () {
    this.keybinds = window.Keyboard;
    this.keybinds.bindKeys('s', 'keydown', this.start.bind(this));
    this.keybinds.bindKeys('p', 'keydown', this.pause.bind(this));
    this.keybinds.bindKeys('r', 'keydown', this.resume.bind(this));
    this.keybinds.bindKeys(['down', 'left', '-'], 'keydown', this.minus.bind(this));
    this.keybinds.bindKeys(['up', 'right', '+'], 'keydown', this.plus.bind(this));
};

Resizive.prototype.getSiteUrlFromQueryString = function () {
    var queryObject = this.getQueryStringObject();
    return queryObject.url || null;
};

Resizive.prototype.setWidthFromQueryString = function () {
    var queryObject = this.getQueryStringObject();
    if (queryObject.hasOwnProperty('width') && !isNaN(queryObject.width)) {
        this.updateWidth(queryObject.width);
    }
};

Resizive.prototype.getQueryStringObject = function () {
    var queryObject = {};
    var regex = /([^&=]+)=([^&]*)/g;
    var queryString = window.location.search.toString().substring(1);
    queryString += '&' + window.location.hash.toString().substring(1);
    var matches = regex.exec(queryString);

    while (matches) {
        queryObject[decodeURIComponent(matches[1])] = decodeURIComponent(matches[2]);
        matches = regex.exec(queryString);
    }

    return queryObject;
};

Resizive.prototype.animator = function (duration) {
    this.elements.container.animate({
        width: this.config.currWidth
    }, duration, function () {
        this.elements.showWidth.val(this.config.currWidth);
    }.bind(this));
    var hash = '#width=' + encodeURIComponent(this.config.currWidth);
    window.location.hash = hash;
};

Resizive.prototype.keepInBounds = function (reset) {
    if (this.config.currWidth > this.config.maxWidth) {
        this.config.currWidth = this.config.maxWidth;

        if (reset) {
            this.config.direction *= -1;
        }
    } else if (this.config.currWidth < this.config.minWidth) {
        this.config.currWidth = this.config.minWidth;

        if (reset) {
            this.config.direction *= -1;
        }
    }
};

Resizive.prototype.resize = function (durationType, sizeType) {
    var adjustment = this.config[sizeType];
    var duration = this.config[durationType];
    var reset = durationType === 'stepDuration' ? false : true;
    var startingWidth = this.config.currWidth;
    this.config.currWidth = this.config.currWidth + adjustment * this.config.direction;
    this.keepInBounds(reset);

    if (startingWidth !== this.config.currWidth) {
        return this.animator(duration);
    }
};

Resizive.prototype.setWidth = function () {
    var px = this.elements.showWidth.val();
    var startingWidth = this.config.currWidth;

    if (isNaN(px)) {
        this.elements.showWidth.val(this.config.currWidth);
        return;
    }
    this.config.currWidth = parseInt(px, 10);

    if (this.config.currWidth < startingWidth) {
        this.updateDirection(-1);
    } else {
        this.updateDirection(+1);
    }
    this.keepInBounds(false);

    if (startingWidth !== this.config.currWidth) {
        this.animator(this.config.animationDuration);
    }
};

Resizive.prototype.updateDirection = function (newDirection) {
    this.config.direction = newDirection;
};

Resizive.prototype.updateMaxWidth = function () {
    this.config.max = $(window).width();
};

Resizive.prototype.updateWidth = function (newWidth) {
    newWidth = parseInt(newWidth, 10);
    this.config.currWidth = newWidth;
    this.elements.showWidth.val(newWidth);
};

Resizive.prototype.setState = function (is_resizing) {
    this.config.resizing = is_resizing;
    if (is_resizing) {
        this.elements.resumeButton.prop('disabled', true);
        this.elements.pauseButton.prop('disabled', false);
    } else {
        this.elements.resumeButton.prop('disabled', false);
        this.elements.pauseButton.prop('disabled', true);
    }
};

Resizive.prototype.start = function () {
    if (this.config.resizing) {
        return;
    }
    this.setState(true);
    this.animator(this.config.animationDuration);
    this.config.timer = setInterval(function () {
        this.resize('animationDuration', 'animationIncrement');
    }.bind(this), this.config.animationDuration);
    this.elements.startButton.addClass(this.config.classHidden);
    this.elements.resumeButton.removeClass(this.config.classHidden);
};

Resizive.prototype.resume = function () {
    if (this.config.resizing) {
        return;
    }
    this.setState(true);
    this.elements.body.removeClass(this.config.classPause).stop(true, true);
    this.config.timer = setInterval(function () {
        this.resize('animationDuration', 'animationIncrement');
    }.bind(this), this.config.animationDuration);
};

Resizive.prototype.pause = function () {
    this.setState(false);
    this.elements.body.addClass(this.config.classPause).stop(true, true);
    clearInterval(this.config.timer);
    this.updateWidth(this.config.currWidth);
};

Resizive.prototype.minus = function () {
    this.updateDirection(-1);
    this.resize('stepDuration', 'stepIncrememnt');
};

Resizive.prototype.plus = function () {
    this.updateDirection(+1);
    this.resize('stepDuration', 'stepIncrememnt');
};
