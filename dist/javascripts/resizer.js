var Resizive;

Resizive = (function() {
  Resizive.prototype.elementSelectors = {
    templateLinks: 'a[data-template]',
    render: '.render',
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
    templates: [],
    url: null,
    timer: null,
    paused: false,
    resizing: false,
    classResize: 'resizing',
    classPause: 'paused',
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

  function Resizive() {
    var query;
    this.assignElements();
    this.parseTemplates();
    this.setBindings();
    query = this.parseQueryString();
    if (query) {
      this.render('animating');
      this.start(query);
    } else {
      this.render('home', {
        url: ''
      });
    }
    this.verticalDragger = new Dragdealer('resize-control.vertical', {
      horizontal: false,
      vertical: true
    });
    this.horizontalDragger = new Dragdealer('resize-control.horizontal', {
      horizontal: true,
      vertical: false
    });
  }

  Resizive.prototype.assignElements = function() {
    var element, ref, results, selector;
    ref = this.elementSelectors;
    results = [];
    for (element in ref) {
      selector = ref[element];
      if (!this.elements[element] || !this.elements[element].length) {
        results.push(this.elements[element] = $(selector));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Resizive.prototype.parseTemplates = function() {
    var i, len, results, template, templates;
    templates = ['animating-template', 'home-template', 'about-template', 'config-template'];
    results = [];
    for (i = 0, len = templates.length; i < len; i++) {
      template = templates[i];
      results.push(this.parseTemplate(template));
    }
    return results;
  };

  Resizive.prototype.parseTemplate = function(t) {
    var $t;
    $t = $('#' + t);
    return this.data.templates[t] = window.Hogan.compile($t.html());
  };

  Resizive.prototype.render = function(template, context, bodyClass) {
    var contents;
    template = template + '-template';
    contents = this.data.templates[template].render(context);
    this.elements.render.html(contents);
    if (bodyClass) {
      this.elements.body.removeClass().addClass(bodyClass);
    }
    return this.assignElements();
  };

  Resizive.prototype.setBindings = function() {
    $(window).resize((function(_this) {
      return function() {
        return _this.updateMaxWidth;
      };
    })(this));
    this.elements.body.on('click', this.elementSelectors.templateLinks, (function(_this) {
      return function(event) {
        var $t, bodyClass, template;
        event.preventDefault();
        $t = $(event.target);
        bodyClass = $t.data('class');
        template = $t.data('template');
        return _this.render(template, {}, bodyClass);
      };
    })(this));
    this.elements.body.on('click', this.elementSelectors.loadButton, (function(_this) {
      return function() {
        return _this.load();
      };
    })(this));
    this.elements.body.on('click', this.elementSelectors.startButton, (function(_this) {
      return function() {
        return _this.start();
      };
    })(this));
    this.elements.body.on('click', this.elementSelectors.endButton, (function(_this) {
      return function() {
        return _this.end();
      };
    })(this));
    this.elements.body.on('click', this.elementSelectors.pauseButton, (function(_this) {
      return function() {
        return _this.pause();
      };
    })(this));
    this.elements.body.on('click', this.elementSelectors.resumeButton, (function(_this) {
      return function() {
        return _this.resume();
      };
    })(this));
    this.elements.body.on('click', this.elementSelectors.plusButton, (function(_this) {
      return function() {
        return _this.plus();
      };
    })(this));
    this.elements.body.on('click', this.elementSelectors.minusButton, (function(_this) {
      return function() {
        return _this.minus();
      };
    })(this));
    this.elements.body.on('keydown', this.elementSelectors.url, (function(_this) {
      return function(e) {
        e.stopPropagation();
        if (e.which === _this.data.enterKeypause) {
          return _this.start(false);
        }
      };
    })(this));
    this.elements.body.on('blur', this.elementSelectors.showWidth, (function(_this) {
      return function() {
        return _this.setWidth();
      };
    })(this));
    this.elements.body.on('keydown', this.elementSelectors.showWidth, (function(_this) {
      return function(e) {
        e.stopPropagation();
        if (e.which === _this.data.enterKey) {
          e.preventDefault();
          return _this.elements.showWidth.blur();
        }
      };
    })(this));
    return this.setKeyBindings();
  };

  Resizive.prototype.setKeyBindings = function() {
    if (this.k == null) {
      this.k = window.Keyboard;
    }
    this.k.bind('s', 'keydown', (function(_this) {
      return function() {
        return _this.start.bind(_this);
      };
    })(this));
    this.k.bind('e', 'keydown', (function(_this) {
      return function() {
        return _this.end.bind(_this);
      };
    })(this));
    this.k.bind('p', 'keydown', (function(_this) {
      return function() {
        return _this.pause.bind(_this);
      };
    })(this));
    this.k.bind('r', 'keydown', (function(_this) {
      return function() {
        return _this.resume.bind(_this);
      };
    })(this));
    this.k.bind(['down', 'left', '-'], 'keydown', (function(_this) {
      return function() {
        return _this.minus.bind(_this);
      };
    })(this));
    return this.k.bind(['up', 'right', '+'], 'keydown', (function(_this) {
      return function() {
        return _this.plus.bind(_this);
      };
    })(this));
  };

  Resizive.prototype.parseQueryString = function() {
    var params;
    params = this.getQueryString();
    if (params.hasOwnProperty('url') && params.hasOwnProperty('width')) {
      if (params.url !== '' && !isNaN(params.width)) {
        this.elements.url.val(params.url);
        this.data.currWidth = parseInt(params.width, 10);
        this.elements.showWidth.text(params.width + 'px').blur();
      }
      return true;
    }
    return false;
  };

  Resizive.prototype.getQueryString = function() {
    var matches, queryString, regex, result;
    result = {};
    queryString = window.location.hash.toString().substring(1);
    regex = /([^&=]+)=([^&]*)/g;
    matches = void 0;
    matches = regex.exec(queryString);
    while (matches) {
      result[decodeURIComponent(matches[1])] = decodeURIComponent(matches[2]);
      matches = regex.exec(queryString);
    }
    this.data.url = result.url;
    return result;
  };

  Resizive.prototype.load = function() {
    this.elements.body.addClass(this.data.classResize);
    this.elements.img.removeClass('hidden');
    this.data.url = this.data.url || this.elements.url.val();
    if (this.data.url.indexOf('://') === -1) {
      this.data.url = 'http://' + this.data.url;
    }
    this.render('animating', {
      url: this.data.url
    });
    $(this.elementSelectors.resizer).one('load', (function(_this) {
      return function() {
        _this.elements.img.addClass('hidden');
        $('.resizer').removeClass('hidden').css({
          'height': 640,
          'width': 320
        });
        _this.keepInBounds(false);
        _this.animator(_this.data.animationDuration);
        return _this.pause();
      };
    })(this));
    this.data.paused = true;
    return this.data.resizing = false;
  };

  Resizive.prototype.start = function(queryLoad) {
    this.elements.body.addClass(this.data.classResize);
    this.elements.img.removeClass('hidden');
    this.data.url = this.data.url || this.elements.url.val();
    if (this.data.url.indexOf('://') === -1) {
      this.data.url = 'http://' + this.data.url;
    }
    this.render('animating', {
      url: this.data.url
    });
    $(this.elementSelectors.resizer).one('load', (function(_this) {
      return function() {
        _this.elements.img.addClass('hidden');
        $('.resizer').removeClass('hidden').css({
          'height': $(window).height()
        });
        if (queryLoad === true) {
          _this.keepInBounds(false);
          _this.animator(_this.data.animationDuration);
          return _this.pause();
        } else {
          return _this.data.timer = setInterval(function() {
            return _this.resize('animationDuration', 'animationIncrement');
          }, _this.data.animationDuration);
        }
      };
    })(this));
    this.data.paused = false;
    return this.data.resizing = true;
  };

  Resizive.prototype.end = function() {
    var mw;
    mw = this.data.maxWidth;
    this.elements.body.removeClass(this.data.classResize);
    clearInterval(this.data.timer);
    this.elements.body.stop(true, true);
    this.elements.img.addClass('hidden');
    $(this.elementSelectors.resizer).remove();
    this.elements.body.removeClass(this.data.classPause);
    this.data.direction = -1;
    this.render('home', {
      url: this.data.url
    });
    this.data.url = null;
    this.data.currWidth = mw;
    this.elements.body.width(mw);
    this.elements.header.width(mw);
    this.elements.showWidth.text(mw + 'px');
    window.location.hash = '';
    this.data.paused = false;
    return this.data.resizing = false;
  };

  Resizive.prototype.animator = function(duration) {
    this.elements.body.animate({
      width: this.data.currWidth
    }, duration, (function(_this) {
      return function() {
        return _this.elements.showWidth.text(_this.data.currWidth + 'px');
      };
    })(this));
    return window.location.hash = '#url=' + encodeURIComponent(this.elements.url.val()) + '&width=' + encodeURIComponent(this.data.currWidth);
  };

  Resizive.prototype.keepInBounds = function(reset) {
    if (this.data.currWidth > this.data.maxWidth) {
      this.data.currWidth = this.data.maxWidth;
      if (reset) {
        return this.data.direction *= -1;
      }
    } else if (this.data.currWidth < this.data.minWidth) {
      this.data.currWidth = this.data.minWidth;
      if (reset) {
        return this.data.direction *= -1;
      }
    }
  };

  Resizive.prototype.minus = function() {
    this.updateDirection(-1);
    return this.resize('stepDuration', 'stepIncrememnt');
  };

  Resizive.prototype.pause = function() {
    this.elements.body.addClass(this.data.classPause).stop(true, true);
    clearInterval(this.data.timer);
    this.updateWidth(this.elements.body.width());
    return this.data.paused = true;
  };

  Resizive.prototype.plus = function() {
    this.updateDirection(+1);
    return this.resize('stepDuration', 'stepIncrememnt');
  };

  Resizive.prototype.resize = function(durationType, sizeType) {
    var adjustment, duration, reset, startingWidth;
    adjustment = this.data[sizeType];
    duration = this.data[durationType];
    reset = (durationType === 'stepDuration' ? false : true);
    startingWidth = this.data.currWidth;
    this.data.currWidth = this.data.currWidth + (adjustment * this.data.direction);
    this.keepInBounds(reset);
    if (startingWidth !== this.data.currWidth) {
      return this.animator(duration);
    }
  };

  Resizive.prototype.resume = function() {
    this.elements.body.removeClass(this.data.classPause).stop(true, true);
    this.data.timer = setInterval((function(_this) {
      return function() {
        return _this.resize('animationDuration', 'animationIncrement');
      };
    })(this), this.data.animationDuration);
    return this.data.paused = false;
  };

  Resizive.prototype.setWidth = function() {
    var px, startingWidth;
    px = this.elements.showWidth.text().replace(' ', '').replace('px', '').replace('em', '');
    startingWidth = this.data.currWidth;
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
      return this.animator(this.data.animationDuration);
    }
  };

  Resizive.prototype.updateDirection = function(dir) {
    return this.data.direction = dir;
  };

  Resizive.prototype.updateMaxWidth = function() {
    return this.data.max = $(window).width();
  };

  Resizive.prototype.updateWidth = function(w) {
    this.data.currWidth = w;
    return this.elements.showWidth.text(this.data.currWidth + 'px');
  };

  return Resizive;

})();

$(function() {
  return window.resizive = new Resizive;
});
