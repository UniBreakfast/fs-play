const fs = require('fs'),  fsp = fs.promises,
  {stringify} = JSON,  {assign, fromEntries} = Object,

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
    fsp.rmdir(path, {recursive: true}))

module.exports = {mkdir, copy, move, dup, rename, remove}