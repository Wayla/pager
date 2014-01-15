var Animator = require('./animator')
  , Velocity = require('./velocity')
  , Page = require('./page')
  , getPrefix = require('./prefix')
  , interpolators = require('./interpolators')
  , transformPrefix = getPrefix('transform')
  , Emitter = require('emitter')

// create a page constructor
// give page a previous animator
// events as methods
// closure variables as instance properties

function Pager(pageEls) {
  var that = this
  this.pages = []

  pageEls.reverse().forEach(function(pageEl, index) {
    var prevPage = that.pages[index - 1]
      , isLast = index === pageEls.length - 1

    that.pages.push(new Page(pageEl, prevPage, isLast))
  })
}

Pager.prototype.push = function(el) {
  var lastPage = this.pages[this.pages.length - 1]
  lastPage.isLast = false
  var page = new Page(el, lastPage, true)
  that.pages.push()
}

module.exports = Pager