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


  wait = (stream, parts=[])=> new Promise((resolve, reject)=>
    stream.on('error', reject).on('data', part => parts.push(part))
      .on('end', ()=> resolve(Buffer.concat(parts).toString('utf8'))))

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

createServer((req, resp)=> {
  if (req.method == 'PUT')
    req.pipeIntoFile(req.url)
      .then(()=> resp.end('ok'))
      .catch(()=> resp.end('error'))
  else if (req.method == 'GET') {
    if (req.url.endsWith('??'))
      explore(__dirname+req.url.replace(/[\\/]?\?\?/, ''))
        .then(descr => resp.json(descr))
    else if (req.url.endsWith('?'))
      scout(__dirname+req.url.replace(/[\\/]?\?/, ''))
        .then(descr => resp.json(descr))
    else resp.end('fetch now!')
  }

}).listen(3000,
  ()=> (console.clear(), c('Server started at http://localhost:3000')))


assign(global, {date2str, fs, fsp, __dirname, explore, recon, scout, wait})
