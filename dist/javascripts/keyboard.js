var Keyboard,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Keyboard = (function() {
  function Keyboard() {
    this.unbindAll = bind(this.unbindAll, this);
    this.unbind = bind(this.unbind, this);
    this.bind = bind(this.bind, this);
  }

  Keyboard.prototype.body = document.body;

  Keyboard.prototype.keys = {
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    e: 69,
    p: 80,
    r: 82,
    s: 83,
    '+': 107,
    '-': 109,
    '?': 191
  };

  Keyboard.prototype.codes = {};

  Keyboard.prototype.methods = ['keydown', 'keyup', 'keypress'];

  Keyboard.prototype.bindings = {
    'keydown': {},
    'keyup': {},
    'keypress': {}
  };

  Keyboard.prototype.isArray = function(value) {
    var s;
    s = '[object Array]';
    return Array.isArray || function(value) {
      return {}.toString.call(value === s);
    };
  };

  Keyboard.prototype.generateCodes = function() {
    var code, key, ref, results;
    ref = this.keys;
    results = [];
    for (key in ref) {
      code = ref[key];
      results.push(this.mapCode(key, code));
    }
    return results;
  };

  Keyboard.prototype.mapCode = function(key, code) {
    return this.codes[code] = key;
  };

  Keyboard.prototype.mapper = function(method, event) {
    var code, func, key, tag;
    code = event.keyCode;
    tag = event.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea') {
      return false;
    }
    if (!(code in this.codes)) {
      return false;
    }
    key = this.codes[code];
    func = this.bindings[method][key]();
    if (this.doesBindingExist(key, method)) {
      return func();
    }
  };

  Keyboard.prototype.sanitizeMethod = function(method) {
    if (indexOf.call(this.methods, method) >= 0) {
      return method;
    } else {
      return 'keydown';
    }
  };

  Keyboard.prototype.sanitizeKeys = function(keys) {
    var index, key, validKeys;
    return validKeys = (function() {
      var i, len, results;
      results = [];
      for (index = i = 0, len = keys.length; i < len; index = ++i) {
        key = keys[index];
        results.push((function(_this) {
          return function(key) {
            if (key in _this.keys) {
              return key;
            }
          };
        })(this)(key));
      }
      return results;
    }).call(this);
  };

  Keyboard.prototype.doesBindingExist = function(key, method) {
    if (!(method in this.bindings)) {
      return false;
    }
    return key in this.bindings[method];
  };

  Keyboard.prototype.register = function(key, method, func) {
    this.bindings[method][key] = func;
    if (document.addEventListener) {
      this.body.addEventListener(method, this.mapper.bind(this, method), false);
    } else {
      this.body.addEventListener('on' + method, this.mapper.bind(this, method));
    }
    return this.bindings[method][key];
  };

  Keyboard.prototype.unregister = function(key, method) {
    if (document.removeEventListener) {
      this.body.removeEventListener(method, this.mapper.bind(this, method), false);
    } else {
      this.body.detachEvent(method, this.mapper.bind(this, method));
    }
    return delete this.bindings[method][key];
  };

  Keyboard.prototype.unbindMethod = function(method) {
    var key, results;
    results = [];
    for (key in this.keys) {
      results.push(unbind(key, method));
    }
    return results;
  };

  Keyboard.prototype.bind = function(keys, method, func) {
    var i, index, key, len, results;
    if (!this.isArray(keys)) {
      keys = [keys];
    }
    keys = this.sanitizeKeys(keys);
    method = this.sanitizeMethod(method);
    results = [];
    for (index = i = 0, len = keys.length; i < len; index = ++i) {
      key = keys[index];
      results.push((function(_this) {
        return function(key) {
          if (!_this.doesBindingExist(key, method)) {
            return _this.register(key, method, func);
          }
        };
      })(this)(key));
    }
    return results;
  };

  Keyboard.prototype.unbind = function(key, method) {
    if (!(key in this.keys)) {
      return false;
    }
    method = this.sanitizeMethod(method);
    if (!this.doesBindingExist(key, method)) {
      return;
    }
    return this.unregister(key, method);
  };

  Keyboard.prototype.unbindAll = function() {
    var i, len, method, ref, results;
    ref = this.methods;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      method = ref[i];
      results.push(this.unbindMethod(method));
    }
    return results;
  };

  return Keyboard;

})();

$(function() {
  window.Keyboard = new Keyboard();
  return window.Keyboard.generateCodes();
});

//# sourceMappingURL=maps/keyboard.js.map