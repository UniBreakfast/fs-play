try { require('c4console') } catch {}

const fs = require('fs'),  fsp = fs.promises,
  {createServer, ServerResponse} = require('http'),
  Stream = require('stream'),
  {stat, readdir} = fsp,  {stringify} = JSON,  {assign, fromEntries} = Object,
  all = Promise.all.bind(Promise),
  date2str = date => stringify(date).slice(1,20).replace('T',' '),

  explore = path => stat(path).then(stats => {
    const name = path.match(/[^/\\]*$/)[0],
          {mtime, size} = stats,  dir = stats.isDirectory(),
          report = {name, date: date2str(mtime)}
    return !dir? assign(report, {size}) : readdir(path)
      .then(list => all(list.map(name => explore(path+'/'+name)))
        .then(reports => assign(report, {subs: reports})))
  }),

  recon = path => stat(path).then(stats => {
    const {size} = stats,  dir = stats.isDirectory()
    return !dir? size : readdir(path)
      .then(list => all(list.map(name => recon(path+'/'+name)
        .then(report => [name, report]))).then(fromEntries))
  }),

  scout = path =>
    recon(path).then(report => ({[path.match(/[^/\\]*$/)[0]]: report})),

  remove = path => fsp.unlink(path).catch(()=>
    fsp.rmdir(path, {recursive: true})),

  wait = (stream, parts=[])=> new Promise((resolve, reject)=>
    stream.on('error', reject).on('data', part => parts.push(part))
      .on('end', ()=> resolve(Buffer.concat(parts).toString('utf8')))),

  typeDict = {
    html: 'text/html',
    json: 'application/json',
    css: 'text/css',
    txt: 'text/plain',
    ico: 'image/x-icon',
    jpg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    mp3: 'audio/mpeg',
    js: 'application/javascript',
  }

Stream.prototype.pipeIntoFile = function (path) {
  path = path.replace(/^\/|\/$/g, '')
  const dir = path.replace(/(^|\/)[^\/]*$/, '')
  return new Promise(async (resolve, reject)=> {
    try {
      if (dir) await fsp.mkdir(dir, {recursive: true})
      this.on('end', resolve).pipe(fs.createWriteStream(path))
    } catch { reject() }
  })
}

ServerResponse.prototype.json = function (obj) {
  this.setHeader('Content-Type', 'application/json')
  this.end(stringify(obj))
}

createServer(async (req, resp)=> {
  let {method, url} = req
  if (method=='PUT')  req.pipeIntoFile(url)
    .then(()=> resp.end('ok'), ()=> resp.end('error'))
  else if (method=='DELETE')  remove(__dirname+url)
    .then(()=> resp.end('ok'), ()=> resp.end('error'))
  else if (method=='GET') {
    try {
      if (url.endsWith('??'))
        resp.json(await explore(__dirname+url.replace(/[\\/]?\?\?/, '')))
      else if (url.endsWith('?'))
        resp.json(await scout(__dirname+url.replace(/[\\/]?\?/, '')))
      else {
        let path = process.cwd()+url
        if ((await stat(path).catch(_=> stat(path+='.html'))).isDirectory() &&
          (await stat(path+='/index.html')).isDirectory()) throw 0
        const match = path.match(/\.(\w+)$/), ext = match? match[1] : 'html'

        fs.createReadStream(path).pipe(resp)
        resp.setHeader('Content-Type', typeDict[ext])
      }
    } catch { resp.end('"... sorry, '+url+' is not available"') }
  }
}).listen(3000,
  ()=> (console.clear(), c('Server started at http://localhost:3000')))


assign(global, {date2str, fs, fsp, __dirname, explore, recon, scout, wait})