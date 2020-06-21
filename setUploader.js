function setUploader({pathsrc, namesrc, chooser, starter, dropzone,
                      informcb, reportcb, fetchArgs, multiple}) {
  let files
  const {body} = document,  isFn = val => typeof val=='function'
        getPath =()=> pathsrc? isFn(pathsrc)? pathsrc() : pathsrc : '',
        getName = i => {
          let name = namesrc? isFn(namesrc)? namesrc()||files[i].name :
                      namesrc : files[i].name
          if (multiple && files[1] && name!=files[i].name)
            name = name.replace(/(\.|$)/, String(i+1).padStart(3, 0)+'$1')
          return name
        },
        getArgs = i => fetchArgs? isFn(fetchArgs)?
                        fetchArgs(getPath(), getName(i), files[i]) :
                          [fetchArgs[0], {...fetchArgs[1], body: files[i]}] :
                            defaultFetchArgs(getPath(), getName(i), files[i]),
        start =()=> files?.length && files.forEach((_, i)=>
          fetch(...getArgs(i)).then(res => reportcb(res, i) || Boolean))

  if (chooser) {
    const choose =()=> {
      const input = Object.assign(document.createElement('input'),
                                  {type: 'file', hidden: true, multiple}),
        work =()=> {
          body.removeEventListener('mousemove', work)
          if (input.value) {
            files = [...input.files]
            if (informcb) informcb(files, getPath(), getName)
            if (!starter) start()
          }
          input.remove()
        },
        select =()=> {
          input.click()
          body.removeEventListener('click', select)
          body.addEventListener('mousemove', work)
          input.addEventListener('change', work)
        }
      body.append(input)
      body.addEventListener('click', select)
    }
    isFn(chooser)? chooser(choose) : chooser.addEventListener('click', choose)
  }

  if (starter) isFn(starter)? starter(start) :
    starter.addEventListener('click', start)

  if (dropzone) {
    ['dragenter', 'dragover', 'drop'].forEach(ename => dropzone.addEventListener(ename, e => {e.stopPropagation(); e.preventDefault()}))
    dropDiv.ondrop = e => {
      if (![...e.dataTransfer.items].every(item =>
        item.webkitGetAsEntry().isFile)) return
      files = [...e.dataTransfer.files].slice(0, ...multiple? []:[1])
      if (informcb) informcb(files, getPath(), getName)
      if (!starter) start()
    }
  }
}

function defaultFetchArgs(path, name, body) {
  return [path+'/'+(name || body.name), {method: 'PUT', body}]
}


pathInp.oninput = pathInp.onchange =()=> {
  try {pathSpan.innerText = pathInp.value? `"${pathInp.value}"`:'root'} catch {}
}
nameInp.oninput = nameInp.onchange =()=> {
  try {nameSpan.innerText = nameInp.value? ` as "${nameInp.value}"`:''} catch {}
}

setUploader({
  pathsrc: ()=> pathInp.value, namesrc: ()=> nameInp.value,
  chooser: selectBtn, starter: uploadBtn, dropzone: dropDiv, multiple: true,
  informcb: (files, path, getName)=> informer.innerHTML = `File(s) "${files.map(file => file.name).join(', ')}" (${(files.reduce((sum, file)=> sum+file.size, 0)/1024/1024).toFixed(2)}Mb total) will be uploaded to <span id="pathSpan">${path? `"${path}"`:'root'}</span><span id="nameSpan">${nameInp.value? ` as "${files[1]? nameInp.value.replace(/(\.|$)/, '000'+'$1') : nameInp.value}"`:''}</span>`,
  reportcb: (response, i) => response.text().then(answer => console.log("Server answered: ", answer, i)),
  fetchArgs: (path, name, body)=> [path+'/'+name, {method: 'PUT', body}]
})
