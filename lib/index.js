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
