
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("pager/lib/prefix.js", function(exports, require, module){
var prefixes = ['-webkit-', '-moz-', '-ms-', '-o-']

function getPrefix(prop) {
  for(var i = 0 ; i < prefixes.length ; i++) {
    if(typeof document.body.style[prefixes[i] + prop] !== 'undefined') {
      return prefixes[i] 
    }
  }
  return ''
}

module.exports = getPrefix
});
require.register("pager/lib/index.js", function(exports, require, module){
var Animator = require('./animator')
  , Velocity = require('./velocity')
  , getPrefix = require('./prefix')
  , interpolators = require('./interpolators')
  , transformPrefix = getPrefix('transform')
  , Emitter = require('emitter')

function Pager(pages) {
  var animators = []
    , moving

  pages.reverse().forEach(function(page, index) {
    var initial
      , velocity
      , animator = animators[index] = new Animator([page], 0, -page.clientHeight, 'Y', {})
      , previousPage = pages[index - 1]
      , previousAnimator = animators[index - 1]
      , isLast = (index === pages.length - 1)
      , lastDelta

    page.addEventListener('touchstart', function(evt) {
      velocity = new Velocity()
      initial = evt.touches[0].pageY
      moving = true
      velocity.pushPosition(initial)
    })

    page.addEventListener('touchend', function(evt) {
      if(!moving) return
      moving = false
      var top = page.scrollTop 
        , totalScroll = page.scrollHeight
        , currentScroll = top + page.offsetHeight
        , scrolledToTop = top === 0
        , scrolledToBottom = currentScroll === totalScroll

      if(previousAnimator && lastDelta > 0 && scrolledToTop) {
        if(previousAnimator.animating) return
        previousAnimator.launch(velocity.getVelocity(), function() {})
      } else if(!isLast && scrolledToBottom) {
        if(animator.animating) return
        animator.launch(velocity.getVelocity(), function() {})
      }
    })

    page.addEventListener('touchmove', function(evt) {
      if(!moving) return evt.preventDefault()

      var delta = lastDelta = evt.touches[0].pageY - initial
        , top = page.scrollTop
        , totalScroll = page.scrollHeight
        , currentScroll = top + page.offsetHeight
        , scrolledToTop = top === 0
        , scrolledToBottom = currentScroll === totalScroll

      velocity.pushPosition(evt.touches[0].pageY)
      if(delta > 0 && scrolledToTop) {
        animator.updatePosition(0)
        if(previousAnimator) {
          if(previousAnimator.animating) return evt.preventDefault()
          previousAnimator.updatePosition(delta - previousPage.clientHeight)
        }
        evt.preventDefault()
      }
      if(delta < 0 && scrolledToBottom) {
        if(!isLast) {
          if(animator.animating) return evt.preventDefault()
          animator.updatePosition(delta)
        }
        if(previousAnimator) {
          if(previousAnimator.animating) return evt.preventDefault()
          previousAnimator.updatePosition(delta - previousPage.clientHeight)
        }
        evt.preventDefault()
      }
    })
  })
}

module.exports = Pager

});
require.register("pager/lib/animator.js", function(exports, require, module){
var getPrefix = require('./prefix')
  , animationPrefix = getPrefix('animation')
  , transformPrefix = getPrefix('transform')
  , interpolators = require('./interpolators')
  , animationCount = 0
  , stylesheetEl = document.createElement('style')
  , stylesheet

var defaultAnimator = {
  rules: function(position, start, end, axis, launching) {
    var rules = {}
      , x = axis === 'X'
    rules[transformPrefix + 'transform'] = 'translate3d(' + ((x) ? position : 0) + 'px, ' + ((x) ? 0 : position) + 'px, 0)'
    return rules
  },
  interpolatorOpen: interpolators.overshoot(1000, 2, 20),
  interpolatorClose: interpolators.bounce(1000, 0.2)
}

document.head.appendChild(stylesheetEl)
stylesheet = stylesheetEl.sheet

module.exports = Animator
module.exports.stylesheet = stylesheet

function Animator(els, start, end, axis, opts) {
	this.els = els
	this.axis = axis
  this.start = start
  this.end = end
  this.rules = opts.rules || defaultAnimator.rules
  this.interpolatorOpen = opts.interpolatorOpen || defaultAnimator.interpolatorOpen
  this.interpolatorClose = opts.interpolatorClose || defaultAnimator.interpolatorClose
  this.animating = false

  this.currentPosition = this.start
}
Animator.prototype.setEnd = function(end) {
  if(this.currentPosition === this.end) {
    this.updatePosition(end)
  }
  this.end = end
}

Animator.prototype.updatePosition = function(position) {
	this.currentPosition = position
	this.applyCss(position, false)
}

Animator.prototype.open = function(velocity, cb) {
  this.currentPosition = this.start
  this.launch(velocity, cb, false)
}

Animator.prototype.close = function(velocity, cb) {
  this.currentPosition = this.end
  this.launch(velocity, cb, false)
}

Animator.prototype.launch = function(velocity, cb, thrown) {
	var interpolator
	  , that = this
    , isOpening = velocity < 0 && this.start > this.end ||
                  velocity > 0 && this.end > this.start
  this.animating = true

  if(typeof thrown === 'undefined') thrown = true

  if(isOpening) {
	  interpolator = this.interpolatorOpen(this.currentPosition, this.start, this.end, velocity, thrown)
  } else {
    interpolator = this.interpolatorClose(this.currentPosition, this.start, this.end, velocity, thrown)
  }

  function done() {
    var to = interpolator.to
    //always apply the final to value css
    that.applyCss(to, true)
    that.currentPosition = to
    that.animating = false
    cb((to === that.start) ? 'close' : 'open')
  }
  this.jsAnimate(interpolator.duration, interpolator.fn, done)
}

Animator.prototype.jsAnimate = function(duration, fn, cb) {
	var cancelAnimation
	  , first = true
	  , startTime
	  , that = this

	function animate(time) {
		//request the next one right away
    cancelAnimation = requestAnimationFrame(animate)

    if(first) startTime = time
    first = false

    var i
      , length = that.els.length
      , currentTime = (time - startTime) / 1000

    if(currentTime > duration) {
      cancelAnimationFrame(cancelAnimation)
      return cb()
    }

    for(i = 0 ; i < length ; i++) {
      that.applyCss(fn(currentTime), true)
    }
  }
  cancelAnimation = requestAnimationFrame(animate)
}

Animator.prototype.keyframeAnimate = function(duration, fn, cb) {
	var animationName = 'menu-animate-' + animationCount++
    , step = duration / 100
    , length = this.els.length
    , that = this
    , i

	var keyframe = '@' + animationPrefix + 'keyframes ' + animationName + ' {\n'

  for(var i = 0 ; i <= 100 ; i++) {
    keyframe += i + '% { ' + this.css(fn(i * step)) + ' }\n'
  }
  keyframe += '}'

  stylesheet.insertRule(keyframe, 0)
 	for(i = 0 ; i < length ; i++) {
    this.els[i].style[animationPrefix + 'animation'] = animationName + ' ' + duration + 's 1'
  }
  this.els[0].addEventListener('webkitAnimationEnd', function done() {
    stylesheet.deleteRule(0)
    that.els[0].removeEventListener('webkitAnimationEnd', done)
    cb()
  })
}

Animator.prototype.css = function(position, launch) {
	var cssStr = ''
	var rules = this.rules(position, this.start, this.end, this.axis, launch)

	for(rule in rules) {
	  if(rules.hasOwnProperty(rule)) {
	    cssStr += rule + ':' + rules[rule] + ';'
	  }
	}
	return cssStr
}

Animator.prototype.applyCss = function(position, launch) {
	var rules = this.rules(position, this.start, this.end, this.axis, launch)
	  , length = this.els.length
	  , i

	for(rule in rules) {
	  if(rules.hasOwnProperty(rule)) {
	  	for(i = 0 ; i < length ; i++) {
	      this.els[i].style[rule] = rules[rule]
	    }
	  }
	}
}

});
require.register("pager/lib/velocity.js", function(exports, require, module){
module.exports = Velocity

function Velocity() {
	this.positionQueue = []
	this.timeQueue = []
}

Velocity.prototype.pruneQueue = function() {
  //pull old values off of the queue
  while(this.timeQueue.length && this.timeQueue[0] < (Date.now() - 200)) {
    this.timeQueue.shift()
    this.positionQueue.shift()
  }

  var length = this.positionQueue.length
  if(length > 2) {
    var dir = this.positionQueue[length - 1] - this.positionQueue[length - 2] > 0
      , toRemove = 0

    for(var i = length - 2 ; i >= 1 ; i--) {
      if(dir !== (this.positionQueue[i] - this.positionQueue[i - 1] > 0)) {
        toRemove = i
        break
      }
    }

    this.positionQueue.splice(0, toRemove)
    this.timeQueue.splice(0, toRemove)
  }
}

Velocity.prototype.pushPosition = function(position) {
  this.positionQueue.push(position)
  this.timeQueue.push(Date.now())
  this.pruneQueue()
}

Velocity.prototype.getVelocity = function() {

  var length = this.timeQueue.length
  if(length === 1) return 0

  var distance = this.positionQueue[length-1] - this.positionQueue[0]
    , time = (this.timeQueue[length-1] - this.timeQueue[0]) / 1000

  return distance / time
}
});
require.register("pager/lib/interpolators.js", function(exports, require, module){
function quadratic(a, b, c) {
  if(a < 0)
    return (-b - Math.sqrt(b * b - 4 * a * c))/(2 * a)
  else
    return (-b + Math.sqrt(b * b - 4 * a * c))/(2 * a)
}

function vertex(a, b) {
  return -b / (2 * a)
}

function height(a, b, c) {
  return parabola(a, b, c, vertex(a, b))
}

function parabola(a, b, c, x) {
  return a * x * x + b * x + c
}

function accelerate(gravity) {
  return function (from, start, end, velocity) {
    if(!between(from, start, end)) {
      velocity *= 0.1
    }

    var reverse = end < 0
      , to = ((velocity < 0 && !reverse) || (velocity > 0 && reverse )) ? start : end


    var grav = gravity
    if(from > to)
      grav = -grav

    var fallDuration = quadratic(grav, velocity, from - to)
      , finalVelocity = (velocity + (fallDuration * grav))

    return {
      to: to,
      duration: fallDuration,
      gravity: grav,
      finalVelocity: finalVelocity,
      fn: function(time) {
        return to + parabola(grav, velocity, from - to, time)
      }
    }
  }
}

function bounce(gravity, dampening) {
  var accelerationFn = accelerate(gravity)
  return function(from, start, end, velocity, thrown) {
    var accel = accelerationFn(from, start, end, velocity)
      , dampening = 0.2
      , bounceDuration = quadratic(accel.gravity, -accel.finalVelocity * dampening, 0)
      , totalDuration = accel.duration + bounceDuration

    if(!thrown) return accel

    return {
      duration: totalDuration,
      to: accel.to,
      fn: function(time) {
        if(time < accel.duration) return accel.fn(time)
        time -= accel.duration
        return accel.to - parabola(-accel.gravity, accel.finalVelocity * dampening, 0, time)
      }
    }
  }
}

function between(number, start, end) {
  if(start < end)
    return number > start && number < end
  else
    return number < start && number > end
}

function overshoot(gravity, frequency, decay) {
  var accelerationFn = accelerate(gravity)
  return function(from, start, end, velocity, thrown) {
    var accel = accelerationFn(from, start, end, velocity)
      , bounceDuration = 1/(2*frequency)
      , totalDuration = accel.duration + bounceDuration

    if(!thrown) return accel

    return {
      duration: totalDuration,
      to: accel.to,
      fn: function(time) {
        if(time < accel.duration) return accel.fn(time)
        time -= accel.duration

        w = frequency * Math.PI * 2
        return accel.to + (velocity * (Math.sin((time)*w) / Math.exp(decay*(time))/w))
      }
    }
  }
}

var interpolators = module.exports = {
  bounce: bounce,
  overshoot: overshoot,
  accelerate: accelerate
}

});
require.alias("component-emitter/index.js", "pager/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");

require.alias("pager/lib/index.js", "pager/index.js");