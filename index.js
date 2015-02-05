var tokenize = require('html-tokenize')
var through = require('through2')
var pumpify = require('pumpify')

//itemscope, itemtype, itemid, itemprop, itemref

// http://www.jelks.nu/XML/xmlebnf.html
var attrRegex = /(\w+)\s*(?:=\s*(?:[\"]([^\"]+)[\"]|[\']([^\']+)[\']))?/g
var tagRegex = /<(\w+)/g

module.exports = function () {
  var level = 0
  var readText = {}
  var itemScopeLevels = []
  
  return pumpify.obj(
  tokenize(),
  through.obj(function (obj, _, cb) {
    function onOpen() {
      level++
      var tag = obj[1].toString()
      if(tag.slice(-2) === '/>') level--
      if('level' in readText) return
      var elem = parseElement(tag)
      if(!elem) return
      var attrs = elem.attrs
      if('itemprop' in attrs) {
        var property = getProperty(elem.name, attrs)
        this.push({key: attrs.itemprop})
        if(typeof property === 'string') {
          this.push({value: property})
          return
        }
        if(property.type === 'itemscope') {
          itemScopeLevels.push(level)
          this.push({itemscope: 'start'})
          return
        }
        if(property.type === 'textcontent') {
          readText = {level: level, value: ''}
        }
      }
      if('itemscope' in attrs) {
        var item = {itemscope: 'start'}
        if('itemtype' in attrs) item.type = attrs.itemtype
        if('itemid' in attrs) item.id = attrs.itemid
        this.push(item)
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
  })
  )
}






function parseElement(element) {
  var match, attributes
  attributes = {}
  tagRegex.lastIndex = 0
  match = tagRegex.exec(element)
  if(!match) return
  var tag = match[1]
  attrRegex.lastIndex = tagRegex.lastIndex
  while ((match = attrRegex.exec(element)) !== null) {
    attributes[match[1]] = match[2]
  }
  return {name: tag, attrs: attributes}
}

function getProperty(elem, attrs) {
  if('itemscope' in attrs) return {type: 'itemscope'}
  if(elem === 'meta') return attrs.content || ''
  if(['audio', 'embed', 'iframe', 'img', 'source', 'track', 'video'].indexOf(elem) > -1) {
    return attrs.src || '' // TODO: absolutize
  }
  if(['a', 'area', 'link'].indexOf(elem) > -1) return attrs.href || '' // TODO: absolutize
  if(elem === 'object') return attrs.data || '' // TODO: absolutize
  if(elem === 'data') return attrs.value || ''
  if(elem === 'meter') return attrs.value || ''
  if(elem === 'time') return attrs.datetime
  
  return {type: 'textcontent'}
  
}

