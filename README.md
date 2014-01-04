# Pager

  Pager is a library for creating a smooth paging interaction on mobile. Download the latest release here:   [https://rawgithub.com/Wayla/pager/master/release/pager.js](https://rawgithub.com/Wayla/pager/master/release/pager.js)
  
# How to use

  - Create a bunch of sibbling `<div>`s
  - Make sure they all stack on top of each other via something like `position:absolute`
  - Execute:
    ```
    var Pager = require('pager')
    new Pager(/* array containing the sibling <div>s */)

    ```

  
# Demo
  
  [http://wayla.github.io/pager](http://wayla.github.io/pager)

# Development

  To install development dependencies, run `npm install`

  To build a new release, run `./build-release`
