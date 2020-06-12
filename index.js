const fs = require('fs'),  fsp = fs.promises,  http = require('http')

http.createServer((req, resp)=> {
  if (req.method == 'PUT')
    fsp.mkdir(req.url.replace(/(^\/)|(\/[^\/]*$)/g,''), {recursive: true}).then(()=> req.on('end', ()=>
      resp.end('I hear you, here\'s a random number: '+ Math.random()))
        .pipe(fs.createWriteStream(req.url.slice(1))))
      .catch(()=> resp.end('sorry, I can\'t do that'))

  else resp.end('fetch now!')

}).listen(3000)