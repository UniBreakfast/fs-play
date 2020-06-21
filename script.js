const fs = {
  write: (path, body) => fetch(path.replace(/^\\*([^/])/,'/$1'), {method: 'PUT',
    body: typeof body=='object'? JSON.stringify(body) : body}),
  mkdir: path => fetch(path, {method: 'POST', body: JSON.stringify({op: 'mkdir', args: [path]})})
}
