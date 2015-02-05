# microdata-stream
[![NPM](https://nodei.co/npm/microdata-stream.png)](https://nodei.co/npm/microdata-stream/)

This module offers very basic microdata parsing.

There is no support for `itemid` and `itemref` yet.

## Example

Running
```js
var fs = require('fs')
var microdata = require('microdata-stream')

fs.createReadStream('example.html')
  .pipe(microdata())
  .on('data', function (data) {
    console.log(data)
  })
```

with

```html
<section itemscope itemtype="http://schema.org/Person"> 
	Hello, my name is 
	<span itemprop="name">John Doe</span>, 
	I am a 
	<span itemprop="jobTitle">graduate research assistant</span> 
	at the 
	<span itemprop="affiliation">University of Dreams</span>. 
	My friends call me 
	<span itemprop="additionalName">Johnny</span>.
  <br/>
	You can visit my homepage at 
	<a href="http://www.JohnnyD.com" itemprop="url">www.JohnnyD.com</a>. 
	<section itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
		I live at 
		<span itemprop="streetAddress">1234 Peach Drive</span>,
		<span itemprop="addressLocality">Warner Robins</span>,
		<data itemprop="addressRegion" value="Georgia">ERROR</data>
	</section>
</section>
```

results in 
```js
{ itemscope: 'start' }
{ key: 'name' }
{ value: 'John Doe' }
{ key: 'jobTitle' }
{ value: 'graduate research assistant' }
{ key: 'affiliation' }
{ value: 'University of Dreams' }
{ key: 'additionalName' }
{ value: 'Johnny' }
{ key: 'url' }
{ value: 'http://www.JohnnyD.com' }
{ key: 'address' }
{ itemscope: 'start' }
{ key: 'streetAddress' }
{ value: '1234 Peach Drive' }
{ key: 'addressLocality' }
{ value: 'Warner Robins' }
{ key: 'addressRegion' }
{ value: 'Georgia' }
{ itemscope: 'end' }
{ itemscope: 'end' }
```