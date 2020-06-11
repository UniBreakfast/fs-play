const fs = require('fs'),  fsp = fs.promises,  http = require('http')

http.createServer((req, resp)=> {
  if (req.method == 'PUT')
    req.on('end', ()=>
      resp.end('I hear you, here\'s a random number: '+ Math.random()))
        .pipe(fs.createWriteStream('filename.ext'))
  // else

}).listen(3000)