(function(){var t,n=function(t,n){return function(){return t.apply(n,arguments)}},i=[].indexOf||function(t){for(var n=0,i=this.length;i>n;n++)if(n in this&&this[n]===t)return n;return-1};t=function(){function t(){this.unbindAll=n(this.unbindAll,this),this.unbind=n(this.unbind,this),this.bind=n(this.bind,this)}return t.prototype.body=document.body,t.prototype.keys={left:37,up:38,right:39,down:40,e:69,p:80,r:82,s:83,"+":107,"-":109,"?":191},t.prototype.codes={},t.prototype.methods=["keydown","keyup","keypress"],t.prototype.bindings={keydown:{},keyup:{},keypress:{}},t.prototype.isArray=function(t){return Array.isArray||function(t){return{}.toString.call("[object Array]"===t)}},t.prototype.generateCodes=function(){var t,n,i,e;i=this.keys,e=[];for(n in i)t=i[n],e.push(this.mapCode(n,t));return e},t.prototype.mapCode=function(t,n){return this.codes[n]=t},t.prototype.mapper=function(t,n){var i,e,r,o;return i=n.keyCode,o=n.target.tagName.toLowerCase(),"input"===o||"textarea"===o?!1:i in this.codes?(r=this.codes[i],e=this.bindings[t][r](),this.doesBindingExist(r,t)?e():void 0):!1},t.prototype.sanitizeMethod=function(t){return i.call(this.methods,t)>=0?t:"keydown"},t.prototype.sanitizeKeys=function(t){var n,i,e;return e=function(){var e,r,o;for(o=[],n=e=0,r=t.length;r>e;n=++e)i=t[n],o.push(function(t){return function(n){return n in t.keys?n:void 0}}(this)(i));return o}.call(this)},t.prototype.doesBindingExist=function(t,n){return n in this.bindings?t in this.bindings[n]:!1},t.prototype.register=function(t,n,i){return this.bindings[n][t]=i,document.addEventListener?this.body.addEventListener(n,this.mapper.bind(this,n),!1):this.body.addEventListener("on"+n,this.mapper.bind(this,n)),this.bindings[n][t]},t.prototype.unregister=function(t,n){return document.removeEventListener?this.body.removeEventListener(n,this.mapper.bind(this,n),!1):this.body.detachEvent(n,this.mapper.bind(this,n)),delete this.bindings[n][t]},t.prototype.unbindMethod=function(t){var n,i;i=[];for(n in this.keys)i.push(unbind(n,t));return i},t.prototype.bind=function(t,n,i){var e,r,o,s,d;for(this.isArray(t)||(t=[t]),t=this.sanitizeKeys(t),n=this.sanitizeMethod(n),d=[],e=o=0,s=t.length;s>o;e=++o)r=t[e],d.push(function(t){return function(e){return t.doesBindingExist(e,n)?void 0:t.register(e,n,i)}}(this)(r));return d},t.prototype.unbind=function(t,n){return t in this.keys?(n=this.sanitizeMethod(n),this.doesBindingExist(t,n)?this.unregister(t,n):void 0):!1},t.prototype.unbindAll=function(){var t,n,i,e,r;for(e=this.methods,r=[],n=0,i=e.length;i>n;n++)t=e[n],r.push(this.unbindMethod(t));return r},t}(),$(function(){return window.Keyboard=new t,window.Keyboard.generateCodes()})}).call(this);