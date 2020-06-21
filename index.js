try { require('c4console') } catch {}

const fs = require('fs'),  fsp = fs.promises,
  {createServer, ServerResponse} = require('http'),
  Stream = require('stream'),
  {stringify, parse} = JSON,  {assign, fromEntries} = Object,

  all = Promise.all.bind(Promise),

  {stat, readdir, copyFile} = fsp,
  mkdir = path => fsp.mkdir(path, {recursive: true}),
  [copy, move] = [copyFile, fsp.rename].map(fn => (path1,
    path2=path1.replace(/(^|[\\/]+)[^\\/]*$/, ''),
    name=path1.match(/(^|[\\/])([^\\/]*)$/)[2])=>
      mkdir(path2||'.').then(()=> fn(path1, (path2||'.')+'/'+name))),
  [dup, rename] = [copy, move].map(fn =>
    (path, name)=> fn(path, undefined, name)),
  ops = {mkdir, copy, move, dup, rename},

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

  utf = '; charset=utf-8',
  typeDict = {
    html: 'text/html'+utf,
    json: 'application/json'+utf,
    css: 'text/css'+utf,
    txt: 'text/plain'+utf,
    ico: 'image/x-icon',
    jpg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    svg: 'image/svg+xml'+utf,
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    js: 'application/javascript'+utf,
  }

Stream.prototype.pipeIntoFile = function (path) {
  path = path.replace(/^\/|\/$/g, '')
  const dir = path.replace(/(^|\/)[^\/]*$/, '')
  return new Promise(async (resolve, reject)=> {
    try {
      if ((await stat(path).catch(_=>{}))?.isDirectory()) throw 0
      if (dir) await mkdir(dir)
      this.on('end', resolve).on('error', reject)
        .pipe(fs.createWriteStream(path))
    } catch { reject() }
  })
}

ServerResponse.prototype.json = function (obj) {
  this.setHeader('Content-Type', typeDict['json'])
  this.end(stringify(obj))
}

createServer(async (req, resp)=> {
  let {method, url} = req
  url = decodeURI(url)
  if (method=='GET') {
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
    } catch (e) { e.c()
      resp.setHeader('Content-Type', typeDict['json'])
      resp.statusCode = 404
      resp.end('"sorry, '+url+' is not available"')
    }
  }
  else if (method=='POST') {
    const {op, args} = parse(await wait(req))
    try { await ops[op](...args).then(()=> resp.end('ok')) }
    catch { assign(resp, {statusCode:400}).end(op+' operation failed') }
  }
  else if (method=='PUT')  req.pipeIntoFile(url)
    .then(()=> resp.end('ok'), ()=> assign(resp, {statusCode:409}).end('write error'))
  else if (method=='DELETE')  remove(__dirname+url).then(()=> resp.end('ok'))

}).listen(3000,
  ()=> (console.clear(), c('Server started at http://localhost:3000')))


assign(global, {date2str, fs, fsp, stat, rename, dup, mkdir, copy, move, __dirname, explore, recon, scout, wait})
