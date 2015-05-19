/* global $, window, Dragdealer */

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

    this.verticalDragger = new Dragdealer('resize-control.vertical', {
        horizontal: false,
        vertical: true
    });
    this.horizontalDragger = new Dragdealer('resize-control.horizontal', {
        horizontal: true,
        vertical: false
    });

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
    endButton: '.btn-end',
    pauseButton: '.btn-pause',
    resumeButton: '.btn-resume',
    minusButton: '.btn-minus',
    plusButton: '.btn-plus',
    showWidth: '.show-width',
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
    this.elements.body.on('click', this.selectors.endButton, this.end.bind(this));
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
        currWidth: $(window).width(),
        maxWidth: $(window).width()
    };
};

Resizive.prototype.setKeyBindings = function () {
    this.keybinds = window.Keyboard;
    this.keybinds.bindKeys('s', 'keydown', this.start.bind(this));
    this.keybinds.bindKeys('e', 'keydown', this.end.bind(this));
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
        this.updateWidth(queryObject.width, true);
    }
};

Resizive.prototype.getQueryStringObject = function () {
    var queryObject = {};
    var queryString = window.location.search.toString().substring(1);
    var regex = /([^&=]+)=([^&]*)/g;
    var matches = regex.exec(queryString);

    while (matches) {
        queryObject[decodeURIComponent(matches[1])] = decodeURIComponent(matches[2]);
        matches = regex.exec(queryString);
    }

    return queryObject;
};

Resizive.prototype.start = function (queryLoad) {
    this.animator(this.config.animationDuration);
    this.config.timer = setInterval(function () {
        this.resize('animationDuration', 'animationIncrement');
    }.bind(this), this.config.animationDuration);
    this.config.paused = false;
    this.config.resizing = true;
};

Resizive.prototype.end = function () {
    clearInterval(this.config.timer);
    this.elements.body.stop(true, true);
    this.elements.img.addClass(this.config.classHidden);
    this.elements.resizer.remove();
    this.elements.body.removeClass(this.config.classPause);
    this.config.direction = -1;

    this.config.url = null;
    this.config.currWidth = this.config.maxWidth;
    this.elements.body.width(this.config.maxWidth);
    this.elements.val.text(this.config.maxWidth);
    window.location.hash = '';
    this.config.paused = false;
    this.config.resizing = false;
};

Resizive.prototype.animator = function (duration) {
    this.elements.body.animate({
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

Resizive.prototype.minus = function () {
    this.updateDirection(-1);
    this.resize('stepDuration', 'stepIncrememnt');
};

Resizive.prototype.pause = function () {
    this.elements.body.addClass(this.config.classPause).stop(true, true);
    clearInterval(this.config.timer);
    this.updateWidth(this.elements.body.width());
    this.config.paused = true;
};

Resizive.prototype.plus = function () {
    this.updateDirection(+1);
    this.resize('stepDuration', 'stepIncrememnt');
};

Resizive.prototype.resize = function (durationType, sizeType) {
    var adjustment = this.data[sizeType];
    var duration = this.data[durationType];
    var reset = durationType === 'stepDuration' ? false : true;
    var startingWidth = this.config.currWidth;
    this.config.currWidth = this.config.currWidth + adjustment * this.config.direction;
    this.keepInBounds(reset);

    if (startingWidth !== this.config.currWidth) {
        return this.animator(duration);
    }
};

Resizive.prototype.resume = function () {
    this.elements.body.removeClass(this.config.classPause).stop(true, true);
    this.config.timer = setInterval(function () {
        this.resize('animationDuration', 'animationIncrement');
    }.bind(this), this.config.animationDuration);
    this.config.paused = false;
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

Resizive.prototype.updateWidth = function (newWidth, do_blur) {
    newWidth = parseInt(newWidth, 10);
    this.config.currWidth = newWidth;

    if (do_blur) {
        // blur after as a cheap way of resizing iframe
        this.elements.showWidth.val(newWidth).blur();
    } else {
        this.elements.showWidth.val(newWidth);
    }
};
