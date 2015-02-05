var fs = require('fs')
var tokenize = require('html-tokenize')
var through = require('through2')

//itemscope, itemtype, itemid, itemprop, itemref

// http://www.jelks.nu/XML/xmlebnf.html
var attrRegex = /(\w+)\s*(?:=\s*(?:[\"]([^\"]+)[\"]|[\']([^\']+)[\']))?/g

var level = 0

var readText = {}
var itemScopeLevels = []

fs.createReadStream(__dirname + '/example.html')
  .pipe(tokenize())
  .pipe(through.obj(function (obj, _, cb) {
    function onOpen() {
      level++
      var tag = obj[1].toString()
      if(tag.slice(-2) === '/>') level--
      if('level' in readText) return
      var elem = parseElement(tag)
      var attrs = elem.attrs
      if('itemprop' in attrs) {
        var property = getProperty(elem.name, attrs)
        if(typeof property === 'string') return this.push({key: attrs.itemprop, value: property})
        if(property.type === 'itemscope') {
          itemScopeLevels.push(level)
          return this.push({key: attrs.itemprop, itemscope: 'start'})
        }
        if(property.type === 'textcontent') readText = {key: attrs.itemprop, level: level, value: ''}
      }
      if('itemscope' in attrs) {
        this.push({itemscope: 'start'})
        itemScopeLevels.push(level)
      }
    }
    
    if(obj[0] == 'open') {
      onOpen.call(this)
    } else if(obj[0] == 'close') {
        level--
        if('level' in readText) {
          if(level < readText.level) {
            delete readText.level
            this.push(readText)
            readText = {}
          }
        }
        if(level < itemScopeLevels[itemScopeLevels.length - 1]) {
          itemScopeLevels.pop()
          this.push({'itemscope': 'end'})
        }
    } else {
      if('level' in readText) readText.value += obj[1].toString()
    }
    cb()
  }))
  .on('data', function (data) {
    console.log(data)
  })




function parseElement(element) {
  var match, attributes
  attributes = {}
  attrRegex.lastIndex = 0
  match = attrRegex.exec(element)
  var tag = match[1]
  while ((match = attrRegex.exec(element)) !== null) {
    attributes[match[1]] = match[2]
  }
  return {name: tag, attrs: attributes}
}

function getProperty(elem, attrs) {
  if('itemscope' in attrs) return {type: 'itemscope'}
  if(elem === 'meta') return attrs.content || ''
  if(['audio', 'embed', 'iframe', 'img', 'source', 'track', 'video'].indexOf(elem) > -1) {
    return attra.src || '' // TODO: absolutize
  }
  if(['a', 'area', 'link'].indexOf(elem) > -1) return attrs.href || '' // TODO: absolutize
  if(elem === 'object') return attrs.data || '' // TODO: absolutize
  if(elem === 'data') return attrs.value || ''
  if(elem === 'meter') return attrs.value || ''
  if(elem === 'time') return attrs.datetime
  
  return {type: 'textcontent'}
  
}

