/* global $, window, ResiziveStorage */

'use strict';

var Resizive = function (url) {
    this.storage = new ResiziveStorage();
    this.assignElements();
    this.setBindings();
    this.setKeyBindings();
    this.createConfig(url);
    this.setDimensionsFromQueryString();
    this.waitForIframeToLoad();

    if (this.config.rulers) {
        this.elements.rulers.addClass('showRulers');
        this.listenForRulersClick();
    }
};

Resizive.prototype.waitForIframeToLoad = function () {
    // wait for iframe to load to start up the real fun
    this.elements.resizer.one('load', function () {
        this.elements.body.addClass(this.config.class_resize);
        this.elements.img.addClass(this.config.class_hidden);
        this.elements.resizer.removeClass(this.config.class_hidden);
        if (!this.config.scrollbars) {
            this.elements.resizer.attr({
                scrolling: 'no',
                seamless: 'seamless'
            }).addClass('noscroll');
        }
        this.keepInBounds(false, 'both', false);
        this.setupDragToResize();
        this.animator(1); // 1ms animation duration so it appears instantly
        this.pause();
    }.bind(this));
};

Resizive.prototype.setupDragToResize = function () {
    this.elements.container.resizable({
        handles: 'e, s',
        minWidth: this.config.min_width,
        maxWidth: this.config.max_width,
        minHeight: this.config.min_height,
        maxHeight: this.config.max_height,
        iframeFix: true,
        start: function (event, ui) {
            this.elements.resizer.css('pointer-events', 'none');
            this.elements.container.removeClass('transitionable');
        }.bind(this),
        stop: function (event, ui) {
            this.elements.resizer.css('pointer-events', 'auto');
            this.elements.container.addClass('transitionable');
            var new_width = this.elements.container.width();
            var new_height = this.elements.container.height();
            if (this.config.snap) {
                // if snapping is enabled, round to nearest step increment
                var increment = this.config.step_incrememnt;
                new_width = Math.round(new_width / increment) * increment;
                new_height = Math.round(new_height / increment) * increment;
            }
            this.syncWidth(new_width, true);
            this.syncHeight(new_height, true);
            this.updateUri();
        }.bind(this)
    });
};

Resizive.prototype.normalizeUrl = function (url) {
    // if we have a url in the querystring, but not one via constructor,
    // it's likely a page reload or bookmark. use url from querystring
    var query_url = this.getSiteUrlFromQueryString();
    if (query_url && !url) {
        url = query_url;
    }

    // make sure url has a protocol. it might be https, but pretend
    // it's http if user doesn't enter any protocol
    if (url.indexOf('://') === -1) {
        url = 'http://' + url;
    }
    return url;
};

Resizive.prototype.selectors = {
    start_button: '.btnStart',
    resume_button: '.btnResume',
    pause_button: '.btnPause',
    left_button: '.btnLeft',
    right_button: '.btnRight',
    up_button: '.btnUp',
    down_button: '.btnDown',
    refresh_button: '.btnRefresh',
    rorate_button: '.btnRotate',
    show_width: '.showWidth',
    show_height: '.showHeight',
    container: '.resizerContainer',
    resizer: '.resizer',
    url: '.urlEntry',
    img: '.loading',
    rulers: '.rulers',
    horizontal_rulers: '.rulerHorizontal',
    vertical_rulers: '.rulerVertical',
    body: 'body'
};

Resizive.prototype.elements = {};

Resizive.prototype.assignElements = function () {
    Object.keys(this.selectors).forEach(function (selector) {
        this.elements[selector] = $(this.selectors[selector]);
    }.bind(this));
};

Resizive.prototype.setBindings = function () {
    $(window).on('resize', this.updatemax_width.bind(this));
    this.elements.body.on('click', this.selectors.start_button, this.start.bind(this));
    this.elements.body.on('click', this.selectors.pause_button, this.pause.bind(this));
    this.elements.body.on('click', this.selectors.resume_button, this.resume.bind(this));
    this.elements.body.on('click', this.selectors.right_button, this.right.bind(this));
    this.elements.body.on('click', this.selectors.left_button, this.left.bind(this));
    this.elements.body.on('click', this.selectors.up_button, this.up.bind(this));
    this.elements.body.on('click', this.selectors.down_button, this.down.bind(this));
    this.elements.body.on('click', this.selectors.refresh_button, this.refresh.bind(this));
    this.elements.body.on('click', this.selectors.rorate_button, this.rotate.bind(this));

    this.elements.body.on('blur', this.selectors.show_width, this.determineWidth.bind(this));
    this.elements.body.on('keydown', this.selectors.show_width, function (event) {
        event.stopPropagation();

        if (event.which === this.config.enter_key) {
            event.preventDefault();
            this.elements.show_width.blur();
        }
    }.bind(this));

    this.elements.body.on('blur', this.selectors.show_height, this.determineHeight.bind(this));
    this.elements.body.on('keydown', this.selectors.show_height, function (event) {
        event.stopPropagation();

        if (event.which === this.config.enter_key) {
            event.preventDefault();
            this.elements.show_height.blur();
        }
    }.bind(this));
};

Resizive.prototype.createConfig = function (url) {
    var handle_offset = 35;
    var values = this.storage.getValues();

    var window_height = $(window).height();
    var window_width = $(window).width();

    this.constructor.prototype.config = {
        url: this.normalizeUrl(url),
        timer: null,
        paused: false,
        resizing: false,
        class_resize: 'resizing',
        class_pause: 'paused',
        class_hidden: 'hidden',
        enter_key: 13,
        horizontal_direction: -1,
        vertical_direction: -1,
        scrollbars: values.scrollbars,
        rulers: values.rulers,
        snap: values.snap,
        step_duration: values.step_duration,
        step_incrememnt: values.step_increment,
        animation_duration: values.animation_duration,
        animation_increment: values.animation_increment,
        min_height: 320,
        // need room for handle, so don't use 100% of window height
        current_height: window_height - handle_offset,
        max_height: 3000,
        max_height_animation: window_height,
        min_width: 320,
        // need room for handle, so don't use 100% of window width
        current_width: window_width - handle_offset,
        max_width: 3000,
        max_width_animation: window_width
    };
};

Resizive.prototype.setKeyBindings = function () {
    this.keybinds = window.Keyboard;
    this.keybinds.bindKeys('s', this.start.bind(this));
    this.keybinds.bindKeys('p', this.pause.bind(this));
    this.keybinds.bindKeys('r', this.resume.bind(this));
    this.keybinds.bindKeys('left', this.left.bind(this));
    this.keybinds.bindKeys('right', this.right.bind(this));
    this.keybinds.bindKeys('up', this.up.bind(this));
    this.keybinds.bindKeys('down', this.down.bind(this));
};

Resizive.prototype.getSiteUrlFromQueryString = function () {
    var query_object = this.getQueryStringObject();
    return query_object.url || null;
};

Resizive.prototype.setDimensionsFromQueryString = function () {
    var query_object = this.getQueryStringObject();
    if (query_object.hasOwnProperty('width') && !isNaN(query_object.width)) {
        this.syncWidth(query_object.width, true);
    }
    if (query_object.hasOwnProperty('height') && !isNaN(query_object.height)) {
        this.syncHeight(query_object.height, true);
    }
};

Resizive.prototype.getQueryStringObject = function () {
    var query_object = {};
    var regex = /([^&=]+)=([^&]*)/g;
    var query_string = window.location.search.toString().substring(1);
    query_string += '&' + window.location.hash.toString().substring(1);
    var matches = regex.exec(query_string);

    while (matches) {
        query_object[decodeURIComponent(matches[1])] = decodeURIComponent(matches[2]);
        matches = regex.exec(query_string);
    }

    return query_object;
};

Resizive.prototype.animator = function (duration) {
    var width = this.getCurrentWidth();
    var height = this.getCurrentHeight();
    this.elements.container.animate({
        width: width,
        height: height
    }, duration, function () {
        this.setCurrentWidth(width, true);
        this.setCurrentHeight(height, true);
    }.bind(this));
    this.updateUri();
};

Resizive.prototype.updateUri = function () {
    var hash = '#width=' + encodeURIComponent(this.getCurrentWidth());
    hash += '&height=' + encodeURIComponent(this.getCurrentHeight());
    window.location.hash = hash;
};

Resizive.prototype.keepInBounds = function (reset, direction, is_animation) {
    // in need of some serious refactoring out of spaghetti land

    var max_width = this.config.max_width;
    var max_height = this.config.max_height;
    if (is_animation) {
        max_width = this.config.max_width_animation;
        max_height = this.config.max_height_animation;
    }

    var width = this.getCurrentWidth();
    var height = this.getCurrentHeight();

    if (direction === 'horizontal' || direction === 'both') {
        if (width > max_width) {
            this.setCurrentWidth(max_width);
            if (reset) {
                this.config.horizontal_direction *= -1;
            }
        } else if (width < this.config.min_width) {
            this.setCurrentWidth(this.config.min_width);
            if (reset) {
                this.config.horizontal_direction *= -1;
            }
        }
    }

    if (direction === 'vertical' || direction === 'both') {
        if (height > max_height) {
            this.setCurrentHeight(max_height);
            if (reset) {
                this.config.vertical_direction *= -1;
            }
        } else if (height < this.config.min_height) {
            this.setCurrentHeight(this.config.min_height);
            if (reset) {
                this.config.vertical_direction *= -1;
            }
        }
    }
};

Resizive.prototype.resizeHorizontally = function (adjustment, duration, reset, is_animation) {
    var starting_width = this.getCurrentWidth();
    var new_width = starting_width + adjustment * this.config.horizontal_direction;
    this.setCurrentWidth(new_width);
    this.keepInBounds(reset, 'horizontal', is_animation);
    if (starting_width !== this.getCurrentWidth()) {
        this.animator(duration);
    }
};

Resizive.prototype.resizeVertically = function (adjustment, duration, reset, is_animation) {
    var starting_height = this.getCurrentHeight();
    var new_height = starting_height + adjustment * this.config.vertical_direction;
    this.setCurrentHeight(new_height);
    this.keepInBounds(reset, 'vertical', is_animation);
    if (starting_height !== this.getCurrentHeight()) {
        this.animator(duration);
    }
};

Resizive.prototype.resize = function (direction, duration_type, size_type, is_animation) {
    var adjustment = this.config[size_type];
    var duration = this.config[duration_type];
    var reset = duration_type === 'step_duration' ? false : true;
    if (direction === 'horizontal') {
        this.resizeHorizontally(adjustment, duration, reset, is_animation);
    } else {
        this.resizeVertically(adjustment, duration, reset, is_animation);
    }
};

Resizive.prototype.getCurrentWidth = function (from_input) {
    if (from_input) {
        return this.elements.show_width.val();
    }
    return this.config.current_width;
};

Resizive.prototype.setCurrentWidth = function (current_width, to_input) {
    if (to_input) {
        this.elements.show_width.val(current_width);
        return;
    }
    this.config.current_width = current_width;
};

Resizive.prototype.determineWidth = function () {
    var px = this.getCurrentWidth(true);
    var starting_width = this.getCurrentWidth();

    if (isNaN(px)) {
        this.syncWidth(starting_width, true);
        return;
    }
    this.syncWidth(px, false);

    var new_width = this.getCurrentWidth();
    // check current width again to make sure direction didn't change
    if (new_width < starting_width) {
        this.updateDirection(-1, null);
    } else {
        this.updateDirection(+1, null);
    }
    this.keepInBounds(false, 'horizontal', false);

    if (starting_width !== new_width) {
        this.animator(this.config.animation_duration);
    }
};

Resizive.prototype.syncWidth = function (new_width, update_input) {
    new_width = parseInt(new_width, 10);
    this.setCurrentWidth(new_width);

    if (update_input) {
        this.setCurrentWidth(new_width, true);
    }
};

Resizive.prototype.updateDirection = function (horiontal_direction, vertical_direction) {
    // only adjust directions that are passed in. ignore nulls and keep current direction
    this.config.horizontal_direction = horiontal_direction || this.config.horizontal_direction;
    this.config.vertical_direction = vertical_direction || this.config.vertical_direction;
};

Resizive.prototype.updatemax_width = function () {
    this.config.max_width = $(window).width();
};

Resizive.prototype.getCurrentHeight = function (from_input) {
    if (from_input) {
        return this.elements.show_height.val();
    }
    return this.config.current_height;
};

Resizive.prototype.setCurrentHeight = function (current_height, to_input) {
    if (to_input) {
        this.elements.show_height.val(current_height);
        return;
    }
    this.config.current_height = current_height;
};

Resizive.prototype.determineHeight = function () {
    var px = this.getCurrentHeight(true);
    var starting_height = this.getCurrentHeight();

    if (isNaN(px)) {
        this.syncHeight(starting_height, true);
        return;
    }
    this.syncHeight(px, false);
    var new_height = this.getCurrentHeight();

    if (new_height < starting_height) {
        this.updateDirection(null, -1);
    } else {
        this.updateDirection(null, +1);
    }
    this.keepInBounds(false, 'vertical', false);

    if (starting_height !== new_height) {
        this.animator(this.config.animation_duration);
    }
};

Resizive.prototype.syncHeight = function (new_height, update_input) {
    new_height = parseInt(new_height, 10);
    this.setCurrentHeight(new_height);

    if (update_input) {
        this.setCurrentHeight(new_height, true);
    }
};

Resizive.prototype.setState = function (is_resizing) {
    this.config.resizing = is_resizing;
    if (is_resizing) {
        this.elements.resume_button.prop('disabled', true);
        this.elements.pause_button.prop('disabled', false);
    } else {
        this.elements.resume_button.prop('disabled', false);
        this.elements.pause_button.prop('disabled', true);
    }
};

Resizive.prototype.start = function () {
    if (this.config.resizing) {
        return;
    }
    this.elements.container.removeClass('transitionable');
    this.setState(true);
    this.animator(this.config.animation_duration);
    this.config.timer = setInterval(function () {
        this.resize('horizontal', 'animation_duration', 'animation_increment', true);
    }.bind(this), this.config.animation_duration);
    this.elements.start_button.addClass(this.config.class_hidden);
    this.elements.resume_button.removeClass(this.config.class_hidden);
};

Resizive.prototype.resume = function () {
    if (this.config.resizing) {
        return;
    }
    this.elements.container.removeClass('transitionable');
    this.setState(true);
    this.elements.body.removeClass(this.config.class_pause).stop(true, true);
    this.config.timer = setInterval(function () {
        this.resize('horizontal', 'animation_duration', 'animation_increment', true);
    }.bind(this), this.config.animation_duration);
};

Resizive.prototype.pause = function () {
    this.elements.container.addClass('transitionable');
    this.setState(false);
    this.elements.body.addClass(this.config.class_pause).stop(true, true);
    clearInterval(this.config.timer);
    this.syncWidth(this.getCurrentWidth(), true);
};

Resizive.prototype.left = function () {
    this.updateDirection(-1, null);
    this.resize('horizontal', 'step_duration', 'step_incrememnt', false);
};

Resizive.prototype.right = function () {
    this.updateDirection(+1, null);
    this.resize('horizontal', 'step_duration', 'step_incrememnt', false);
};

Resizive.prototype.up = function () {
    this.updateDirection(null, -1);
    this.resize('vertical', 'step_duration', 'step_incrememnt', false);
};

Resizive.prototype.down = function () {
    this.updateDirection(null, +1);
    this.resize('vertical', 'step_duration', 'step_incrememnt', false);
};

Resizive.prototype.refresh = function () {
    // reset some elements to be in their default state while
    // the iframe reloads itself
    this.elements.container.resizable('destroy');
    this.elements.container.attr('style', '');
    this.elements.body.removeClass(this.config.class_resize);
    this.elements.img.removeClass(this.config.class_hidden);
    this.elements.resizer.addClass(this.config.class_hidden);
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
    this.elements.resizer.attr({
        src: new_source
    });
    this.waitForIframeToLoad(true);
};

Resizive.prototype.rotate = function () {
    var new_width = this.getCurrentHeight();
    var new_height = this.getCurrentWidth();
    this.syncWidth(new_width, true);
    this.syncHeight(new_height, true);
    this.animator(this.config.animation_duration);
};

Resizive.prototype.setWidthByRuler = function (event) {
    var left = event.offsetX + 1; // why is this 1 short?
    this.syncWidth(left, true);
    this.animator(this.config.animation_duration);
};

Resizive.prototype.setHeightByRuler = function (event) {
    var top = event.offsetY + 11; // why is this 11 short?
    this.syncHeight(top, true);
    this.animator(this.config.animation_duration);
};

Resizive.prototype.listenForRulersClick = function () {
    var horizontal_func = this.setWidthByRuler.bind(this);
    this.elements.body.on('click', this.selectors.horizontal_rulers, horizontal_func);
    var vertical_func = this.setHeightByRuler.bind(this);
    this.elements.body.on('click', this.selectors.vertical_rulers, vertical_func);
};
