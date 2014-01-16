var Animator = require('./animator')
  , Velocity = require('./velocity')
  , getPrefix = require('./prefix')
  , interpolators = require('./interpolators')
  , transformPrefix = getPrefix('transform')
  , Emitter = require('emitter')

module.exports = Page

function Page(el, prevPage, isLast) {
  var that = this
  this.initial
  this.animator = new Animator([el], 0, -el.clientHeight, 'Y', {})
  this.prevPage = prevPage
  this.isLast = isLast
  this.lastDelta
  this.el = el

  el.addEventListener('touchstart', function(evt) { that.start(evt) })
  el.addEventListener('touchend', function(evt) { that.end(evt) })
  el.addEventListener('touchmove', function(evt) { that.move(evt) })
}

Page.prototype.start = function(evt) {
  this.velocity = new Velocity()
  this.initial = evt.touches[0].pageY
  this.moving = true
  this.velocity.pushPosition(this.initial)
}

Page.prototype.end = function(evt) {
  if(!this.moving) return
  this.moving = false

  var top = this.el.scrollTop
    , totalScroll = this.el.scrollHeight
    , currentScroll = top + this.el.offsetHeight
    , scrolledToTop = top <= 2
    , scrolledToBottom = currentScroll >= totalScroll

  if(this.prevPage && lastDelta > 0 && scrolledToTop && !this.prevPage.animator.animating) {
    this.prevPage.animator.launch(this.velocity.getVelocity(), function() {})
  } else if(!this.isLast && scrolledToBottom && !this.animator.animating) {
    this.animator.launch(this.velocity.getVelocity(), function() {})
  }
}

Page.prototype.move = function(evt) {
  if(!this.moving) return evt.preventDefault()

  var delta = lastDelta = evt.touches[0].pageY - this.initial
    , top = this.el.scrollTop
    , totalScroll = this.el.scrollHeight
    , currentScroll = top + this.el.offsetHeight
    , scrolledToTop = top <= 2
    , scrolledToBottom = currentScroll >= totalScroll

  this.velocity.pushPosition(evt.touches[0].pageY)
  if(delta > 0 && scrolledToTop) {
    this.animator.updatePosition(0)
    if(this.prevPage) {
      if(this.prevPage.animator.animating) return evt.preventDefault()
      this.prevPage.animator.updatePosition(delta - this.prevPage.el.clientHeight)
    }
    console.log('prevent at top')
    evt.preventDefault()
  }
  if(delta < 0 && scrolledToBottom) {
    if(!this.isLast) {
      if(this.animator.animating) return evt.preventDefault()
      this.animator.updatePosition(delta)
    }
    if(this.prevPage) {
      if(this.prevPage.animator.animating) return evt.preventDefault()
      this.prevPage.animator.updatePosition(delta - this.prevPage.el.clientHeight)
    }
    console.log('prevent at bottom')
    evt.preventDefault()
  }
}
