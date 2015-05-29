/* global $, window, resiziveStorage */

'use strict';

var Resizive = function (url) {
    this.assignElements();
    this.setBindings();
    this.setKeyBindings();
    this.createConfig(url);
    this.setDimensionsFromQueryString();
    this.waitForIframeToLoad();

    if (this.config.rulers) {
        this.elements.rulers.addClass('showRulers');
    }
};

Resizive.prototype.waitForIframeToLoad = function () {
    // wait for iframe to load to start up the real fun
    this.elements.resizer.one('load', function () {
        this.elements.body.addClass(this.config.classResize);
        this.elements.img.addClass(this.config.classHidden);
        this.elements.resizer.removeClass(this.config.classHidden);
        if (!this.config.scrollbars) {
            this.elements.resizer.attr({
                'scrolling': 'no',
                'seamless': 'seamless'
            }).addClass('noscroll');
        }
        this.keepInBounds(false, 'both');
        this.setupDragToResize();
        this.animator(1); // 1ms animation duration so it appears instantly
        this.pause();
    }.bind(this));
};

Resizive.prototype.setupDragToResize = function () {
    this.elements.container.resizable({
        handles: 'e, s',
        minWidth: this.config.minWidth,
        maxWidth: this.config.maxWidth,
        minHeight: this.config.minHeight,
        maxHeight: this.config.maxHeight,
        iframeFix: true,
        start: function (event, ui) {
            this.elements.resizer.css('pointer-events', 'none');
        }.bind(this),
        stop: function (event, ui) {
            this.elements.resizer.css('pointer-events', 'auto');
            var new_width = this.elements.container.width();
            var new_height = this.elements.container.height();
            if (this.config.snap) {
                // if snapping is enabled, round to nearest step increment
                var increment = this.config.stepIncrememnt;
                new_width = Math.round(new_width / increment) * increment;
                new_height = Math.round(new_height / increment) * increment;
            }
            this.updateWidth(new_width);
            this.updateHeight(new_height);
            this.updateUri();
        }.bind(this)
    });
};

Resizive.prototype.normalizeUrl = function (url) {
    // if we have a url in the querystring, but not one via constructor,
    // it's likely a page reload or bookmark. use url from querystring
    var queryUrl = this.getSiteUrlFromQueryString();
    if (queryUrl && !url) {
        url = queryUrl;
    }

    // make sure url has a protocol. it might be https, but pretend
    // it's http if user doesn't enter any protocol
    if (url.indexOf('://') === -1) {
        url = 'http://' + url;
    }
    return url;
};

Resizive.prototype.selectors = {
    startButton: '.btn-start',
    resumeButton: '.btn-resume',
    pauseButton: '.btn-pause',
    leftButton: '.btn-left',
    rightButton: '.btn-right',
    uoButton: '.btn-up',
    downButton: '.btn-down',
    refreshButton: '.btn-refresh',
    showWidth: '.show-width',
    showHeight: '.show-height',
    container: '.resizerContainer',
    resizer: '.resizer',
    url: '.url-entry',
    img: '.loading',
    rulers: '.rulers',
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
    this.elements.body.on('click', this.selectors.rightButton, this.right.bind(this));
    this.elements.body.on('click', this.selectors.leftButton, this.left.bind(this));
    this.elements.body.on('click', this.selectors.upButton, this.up.bind(this));
    this.elements.body.on('click', this.selectors.downButton, this.down.bind(this));
    this.elements.body.on('click', this.selectors.refreshButton, this.refresh.bind(this));

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
    var handle_offset = 35;
    var values = resiziveStorage.getValues();

    this.constructor.prototype.config = {
        url: this.normalizeUrl(url),
        timer: null,
        paused: false,
        resizing: false,
        classResize: 'resizing',
        classPause: 'paused',
        classHidden: 'hidden',
        enterKey: 13,
        horizontal_direction: -1,
        vertical_direction: -1,
        scrollbars: values.scrollbars,
        rulers: values.rulers,
        snap: values.snap,
        stepDuration: values.stepduration,
        stepIncrememnt: values.stepincrement,
        animationDuration: values.duration,
        animationIncrement: values.increment,
        minHeight: 320,
        // need room for handle, so don't use 100% of window height
        currHeight: $(window).height() - handle_offset,
        maxHeight: 3000,
        minWidth: 320,
        // need room for handle, so don't use 100% of window width
        currWidth: $(window).width() - handle_offset,
        maxWidth: 3000

        // add max animation width
        // add max animation height
    };
};

Resizive.prototype.setKeyBindings = function () {
    this.keybinds = window.Keyboard;
    this.keybinds.bindKeys('s', 'keydown', this.start.bind(this));
    this.keybinds.bindKeys('p', 'keydown', this.pause.bind(this));
    this.keybinds.bindKeys('r', 'keydown', this.resume.bind(this));
    this.keybinds.bindKeys('left', 'keydown', this.left.bind(this));
    this.keybinds.bindKeys('right', 'keydown', this.right.bind(this));
    this.keybinds.bindKeys('up', 'keydown', this.up.bind(this));
    this.keybinds.bindKeys('down', 'keydown', this.down.bind(this));
};

Resizive.prototype.getSiteUrlFromQueryString = function () {
    var queryObject = this.getQueryStringObject();
    return queryObject.url || null;
};

Resizive.prototype.setDimensionsFromQueryString = function () {
    var queryObject = this.getQueryStringObject();
    if (queryObject.hasOwnProperty('width') && !isNaN(queryObject.width)) {
        this.updateWidth(queryObject.width);
    }
    if (queryObject.hasOwnProperty('height') && !isNaN(queryObject.height)) {
        this.updateHeight(queryObject.height);
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
        width: this.config.currWidth,
        height: this.config.currHeight,
    }, duration, function () {
        this.elements.showWidth.val(this.config.currWidth);
        this.elements.showHeight.val(this.config.currHeight);
        // add showHeight
    }.bind(this));
    this.updateUri();
};

Resizive.prototype.updateUri = function () {
    var hash = '#width=' + encodeURIComponent(this.config.currWidth);
    hash += '&height=' + encodeURIComponent(this.config.currHeight);
    window.location.hash = hash;
};

Resizive.prototype.keepInBounds = function (reset, direction) {
    // in need of some serious refactoring out of spaghetti land
    if (direction === 'horizontal' || direction === 'both') {
        if (this.config.currWidth > this.config.maxWidth) {
            this.config.currWidth = this.config.maxWidth;
            if (reset) {
                this.config.horizontal_direction *= -1;
            }
        } else if (this.config.currWidth < this.config.minWidth) {
            this.config.currWidth = this.config.minWidth;
            if (reset) {
                this.config.horizontal_direction *= -1;
            }
        }
    }

    if (direction === 'vertical' || direction === 'both') {
        if (this.config.currHeight > this.config.maxHeight) {
            this.config.currHeight = this.config.maxHeight;
            if (reset) {
                this.config.vertical_direction *= -1;
            }
        } else if (this.config.currHeight < this.config.minHeight) {
            this.config.currHeight = this.config.minHeight;
            if (reset) {
                this.config.vertical_direction *= -1;
            }
        }
    }
};

Resizive.prototype.resizeHorizontally = function (adjustment, duration, reset) {
    var startingWidth = this.config.currWidth;
    this.config.currWidth += adjustment * this.config.horizontal_direction;
    this.keepInBounds(reset, 'horizontal');
    if (startingWidth !== this.config.currWidth) {
        this.animator(duration);
    }
};

Resizive.prototype.resizeVertically = function (adjustment, duration, reset) {
    var startingHeight = this.config.currHeight;
    this.config.currHeight += adjustment * this.config.vertical_direction;
    this.keepInBounds(reset, 'vertical');
    if (startingHeight !== this.config.currHeight) {
        this.animator(duration);
    }
};

Resizive.prototype.resize = function (direction, durationType, sizeType) {
    var adjustment = this.config[sizeType];
    var duration = this.config[durationType];
    var reset = durationType === 'stepDuration' ? false : true;
    if (direction === 'horizontal') {
        this.resizeHorizontally(adjustment, duration, reset);
    } else {
        this.resizeVertically(adjustment, duration, reset);
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
        this.updateDirection(-1, null);
    } else {
        this.updateDirection(+1, null);
    }
    this.keepInBounds(false, 'horizontal');

    if (startingWidth !== this.config.currWidth) {
        this.animator(this.config.animationDuration);
    }
};

Resizive.prototype.updateDirection = function (horiontalDirection, verticalDirection) {
    // only adjust directions that are passed in. ignore nulls and keep current direction
    this.config.horizontal_direction = horiontalDirection || this.config.horizontal_direction;
    this.config.vertical_direction = verticalDirection || this.config.vertical_direction;
};

Resizive.prototype.updateMaxWidth = function () {
    this.config.maxWidth = $(window).width();
};

// make into syncWidth, with option to sync to: uri, container.width(), or currWidth
Resizive.prototype.updateWidth = function (newWidth) {
    newWidth = parseInt(newWidth, 10);
    this.config.currWidth = newWidth;
    this.elements.showWidth.val(newWidth);
};

// make into syncHeight, with option to sync to: uri, container.height(), or currHeight
Resizive.prototype.updateHeight = function (newHeight) {
    newHeight = parseInt(newHeight, 10);
    this.config.currHeight = newHeight;
    this.elements.showHeight.val(newHeight);
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
        this.resize('horizontal', 'animationDuration', 'animationIncrement');
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
        this.resize('horizontal', 'animationDuration', 'animationIncrement');
    }.bind(this), this.config.animationDuration);
};

Resizive.prototype.pause = function () {
    this.setState(false);
    this.elements.body.addClass(this.config.classPause).stop(true, true);
    clearInterval(this.config.timer);
    this.updateWidth(this.config.currWidth);
};

Resizive.prototype.left = function () {
    this.updateDirection(-1, null);
    this.resize('horizontal', 'stepDuration', 'stepIncrememnt');
};

Resizive.prototype.right = function () {
    this.updateDirection(+1, null);
    this.resize('horizontal', 'stepDuration', 'stepIncrememnt');
};

Resizive.prototype.up = function () {
    this.updateDirection(null, -1);
    this.resize('vertical', 'stepDuration', 'stepIncrememnt');
};

Resizive.prototype.down = function () {
    this.updateDirection(null, +1);
    this.resize('vertical', 'stepDuration', 'stepIncrememnt');
};

Resizive.prototype.refresh = function () {
    // reset some elements to be in their default state while
    // the iframe reloads itself
    this.elements.container.resizable('destroy');
    this.elements.container.attr('style', '');
    this.elements.body.removeClass(this.config.classResize);
    this.elements.img.removeClass(this.config.classHidden);
    this.elements.resizer.addClass(this.config.classHidden);
    this.elements.resizer.removeClass('noscroll');
    this.elements.resizer
        .removeAttr('scrolling')
        .removeAttr('seamless')
        .removeClass('noscroll');

    var random = Math.ceil(Math.random() * 1000000);
    var cache_breaker = 'cache_breaker=' + Date.now() + random;
    var concatenator = '?';
    if (this.config.url.indexOf('?') > 0) {
        concatenator += '&';
    }
    var new_source = this.config.url + concatenator + cache_breaker;
    this.elements.resizer.attr({src: new_source});
    this.waitForIframeToLoad(true);
};
