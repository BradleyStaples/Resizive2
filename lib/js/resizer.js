/* global $, window, Dragdealer */

var Resizive = (function () {
    'use strict';

    Resizive.prototype.elementSelectors = {
        loadButton: '.btn-load',
        startButton: '.btn-start',
        endButton: '.btn-end',
        pauseButton: '.btn-pause',
        resumeButton: '.btn-resume',
        minusButton: '.btn-minus',
        plusButton: '.btn-plus',
        helpButton: '.button-help',
        showWidth: '.show-width',
        resizer: '.resizer',
        header: '.header',
        url: '.url-entry',
        img: '.loading',
        body: 'body'
    };

    Resizive.prototype.elements = {};

    Resizive.prototype.data = {
        url: null,
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

    // this needs to be a constructor
    (function () {
        this.assignElements();
        this.setBindings();
        this.setKeyBindings();
        var query = this.parseQueryString();

        if (query) {
            // this.render('animating');
            this.start(query);
        }

        //  else {
        //     this.render('home', {
        //         url: ''
        //     });
        // }

        this.verticalDragger = new Dragdealer('resize-control.vertical', {
            horizontal: false,
            vertical: true
        });
        this.horizontalDragger = new Dragdealer('resize-control.horizontal', {
            horizontal: true,
            vertical: false
        });
    }.bind(this))();

    Resizive.prototype.assignElements = function () {
        this.elementSelectors.forEach(function (selector) {
            this.elements[selector] = $(selector);
        }.bind(this));
    };

    Resizive.prototype.setBindings = function () {
        $(window).on('resize', this.updateMaxWidth.bind(this));
        this.elements.body.on('click', this.elementSelectors.loadButton, this.load.bind(this));
        this.elements.body.on('click', this.elementSelectors.startButton, this.start.bind(this));
        this.elements.body.on('click', this.elementSelectors.endButton, this.end.bind(this));
        this.elements.body.on('click', this.elementSelectors.pauseButton, this.pause.bind(this));
        this.elements.body.on('click', this.elementSelectors.resumeButton, this.resume.bind(this));
        this.elements.body.on('click', this.elementSelectors.plusButton, this.plus.bind(this));
        this.elements.body.on('click', this.elementSelectors.minusButton, this.minus.bind(this));
        this.elements.body.on('blur', this.elementSelectors.showWidth, this.setWidth.bind(this));
        this.elements.body.on('keydown', this.elementSelectors.url, function (event) {
            event.stopPropagation();

            if (event.which === this.data.enterKey) {
                this.start(false);
            }
        }.bind(this));

        this.elements.body.on('keydown', this.elementSelectors.showWidth, function (event) {
            event.stopPropagation();

            if (event.which === this.data.enterKey) {
                event.preventDefault();
                this.elements.showWidth.blur();
            }
        }.bind(this));
    };

    Resizive.prototype.setKeyBindings = function () {
        this.k = window.Keyboard;
        this.k.bind('s', 'keydown', this.start.bind(this));
        this.k.bind('e', 'keydown', this.end.bind(this));
        this.k.bind('p', 'keydown', this.pause.bind(this));
        this.k.bind('r', 'keydown', this.resume.bind(this));
        this.k.bind(['down', 'left', '-'], 'keydown', this.minus.bind(this));
        this.k.bind(['up', 'right', '+'], 'keydown', this.plus.bind(this));
    };

    Resizive.prototype.parseQueryString = function () {
        var params = this.getQueryString();

        if (!params.hasOwnProperty('url') || !params.hasOwnProperty('width')) {
            return false;
        }

        if (params.url !== '' && !isNaN(params.width)) {
            this.elements.url.val(params.url);
            this.data.currWidth = parseInt(params.width, 10);
            this.elements.showWidth.text(params.width + 'px').blur();
        }

        return true;
    };

    Resizive.prototype.getQueryString = function () {
        var queryObject = {};
        var queryString = window.location.hash.toString().substring(1);
        var regex = /([^&=]+)=([^&]*)/g;
        var matches = regex.exec(queryString);

        while (matches) {
            queryObject[decodeURIComponent(matches[1])] = decodeURIComponent(matches[2]);
            matches = regex.exec(queryString);
        }

        if (queryObject.url) {
            this.data.url = queryObject.url;
        }

        return queryObject;
    };

    Resizive.prototype.load = function () {
        this.elements.body.addClass(this.data.classResize);
        this.elements.img.removeClass(this.data.classHidden);
        this.data.url = this.data.url || this.elements.url.val();

        if (this.data.url.indexOf('://') === -1) {
            this.data.url = 'http://' + this.data.url;
        }

        // this.render('animating', {
        //     url: this.data.url
        // });
        this.elements.resizer.one('load', function () {

            this.elements.img.addClass(this.data.classHidden);
            this.elements.resizer.removeClass(this.data.classHidden).css({
                height: 640,
                width: 320
            });
            this.keepInBounds(false);
            this.animator(this.data.animationDuration);
            this.pause();
        }.bind(this));
        this.data.paused = true;
        this.data.resizing = false;
    };

    Resizive.prototype.start = function (queryLoad) {
        this.elements.body.addClass(this.data.classResize);
        this.elements.img.removeClass(this.data.classHidden);
        this.data.url = this.data.url || this.elements.url.val();

        if (this.data.url.indexOf('://') === -1) {
            this.data.url = 'http://' + this.data.url;
        }

        // this.render('animating', {
        //     url: this.data.url
        // });
        this.elements.resizer.one('load', function () {

            this.elements.img.addClass(this.data.classHidden);
            this.elements.resizer.removeClass(this.data.classHidden).css({
                height: $(window).height()
            });

            if (queryLoad) {
                this.keepInBounds(false);
                this.animator(this.data.animationDuration);
                this.pause();

                return;
            }

            this.data.timer = setInterval(function () {
                this.resize('animationDuration', 'animationIncrement');
            }.bind(this), this.data.animationDuration);
        }.bind(this));
        this.data.paused = false;
        this.data.resizing = true;
    };

    Resizive.prototype.end = function () {
        this.elements.body.removeClass(this.data.classResize);
        clearInterval(this.data.timer);
        this.elements.body.stop(true, true);
        this.elements.img.addClass(this.data.classHidden);
        this.elements.resizer.remove();
        this.elements.body.removeClass(this.data.classPause);
        this.data.direction = -1;

        // this.render('home', {
        //     url: this.data.url
        // });
        this.data.url = null;
        this.data.currWidth = this.data.maxWidth;
        this.elements.body.width(this.data.maxWidth);
        this.elements.header.width(this.data.maxWidth);
        this.elements.showWidth.text(this.data.maxWidth + 'px');
        window.location.hash = '';
        this.data.paused = false;
        this.data.resizing = false;
    };

    Resizive.prototype.animator = function (duration) {
        this.elements.body.animate({
            width: this.data.currWidth
        }, duration, function () {
            this.elements.showWidth.text(this.data.currWidth + 'px');
        }.bind(this));
        var url = encodeURIComponent(this.elements.url.val());
        var query = '#url=' + url + '&width=' + encodeURIComponent(this.data.currWidth);
        window.location.hash = query;
    };

    Resizive.prototype.keepInBounds = function (reset) {
        if (this.data.currWidth > this.data.maxWidth) {
            this.data.currWidth = this.data.maxWidth;

            if (reset) {
                this.data.direction *= -1;
            }
        } else if (this.data.currWidth < this.data.minWidth) {
            this.data.currWidth = this.data.minWidth;

            if (reset) {
                this.data.direction *= -1;
            }
        }
    };

    Resizive.prototype.minus = function () {
        this.updateDirection(-1);
        this.resize('stepDuration', 'stepIncrememnt');
    };

    Resizive.prototype.pause = function () {
        this.elements.body.addClass(this.data.classPause).stop(true, true);
        clearInterval(this.data.timer);
        this.updateWidth(this.elements.body.width());
        this.data.paused = true;
    };

    Resizive.prototype.plus = function () {
        this.updateDirection(+1);
        this.resize('stepDuration', 'stepIncrememnt');
    };

    Resizive.prototype.resize = function (durationType, sizeType) {
        var adjustment = this.data[sizeType];
        var duration = this.data[durationType];
        var reset = durationType === 'stepDuration' ? false : true;
        var startingWidth = this.data.currWidth;
        this.data.currWidth = this.data.currWidth + adjustment * this.data.direction;
        this.keepInBounds(reset);

        if (startingWidth !== this.data.currWidth) {
            return this.animator(duration);
        }
    };

    Resizive.prototype.resume = function () {
        this.elements.body.removeClass(this.data.classPause).stop(true, true);
        this.data.timer = setInterval(function () {
            this.resize('animationDuration', 'animationIncrement');
        }.bind(this), this.data.animationDuration);
        this.data.paused = false;
    };

    Resizive.prototype.setWidth = function () {
        var px = this.elements.showWidth.text();
        px = px.replace(' ', '').replace('px', '');
        var startingWidth = this.data.currWidth;

        if (isNaN(px)) {
            this.elements.showWidth.text(this.data.currWidth + 'px');
            return;
        }
        this.data.currWidth = parseInt(px, 10);

        if (this.data.currWidth < startingWidth) {
            this.updateDirection(-1);
        } else {
            this.updateDirection(+1);
        }
        this.keepInBounds(false);

        if (startingWidth !== this.data.currWidth) {
            this.animator(this.data.animationDuration);
        }
    };

    Resizive.prototype.updateDirection = function (newDirection) {
        this.data.direction = newDirection;
    };

    Resizive.prototype.updateMaxWidth = function () {
        this.data.max = $(window).width();
    };

    Resizive.prototype.updateWidth = function (newWidth) {
        this.data.currWidth = newWidth;
        this.elements.showWidth.text(newWidth + 'px');
    };

    return Resizive;

})();

$(function () {
    'use strict';

    window.resizive = new Resizive();
});
