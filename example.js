var fs = require('fs')
var microdata = require('./')

fs.createReadStream('example.html')
  .pipe(microdata())
  .on('data', function (data) {
    console.log(data)
  })
  
// var request = require('request')
// 
// request('http://allrecipes.com/recipe/guacamole/')
//   .pipe(microdata())
//     .on('data', function (data) {
//       console.log(data)
//     })