function setUploader({pathsrc, namesrc, chooser, starter, dropzone,
                      informcb, reportcb, fetchArgs}) {
  let file
  const {body} = document,  isFn = val => typeof val=='function'
        getPath =()=> pathsrc? isFn(pathsrc)? pathsrc() : pathsrc : '',
        getName =()=> namesrc? isFn(namesrc)? namesrc()||file.name : namesrc :
                        file.name,
        getArgs =()=> fetchArgs? isFn(fetchArgs)?
                        fetchArgs(getPath(), getName(), file) :
                          [fetchArgs[0], {...fetchArgs[1], body: file}] :
                            defaultFetchArgs(getPath(), getName(), file),
        start =()=> file && fetch(...getArgs()).then(reportcb || console.log)

  if (chooser) {
    const choose =()=> {
      const input = Object.assign(document.createElement('input'),
                                  {type: 'file', hidden: true}),
        work =()=> {
          body.removeEventListener('mousemove', work)
          if (input.value) {
            file = input.files[0]
            if (informcb) informcb(file, getPath(), getName())
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
      file = e.dataTransfer.files[0]
      if (informcb) informcb(file, getPath(), getName())
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
  chooser: selectBtn,
  starter: start => uploadBtn.onmouseover = start, dropzone: dropDiv,
  informcb: (body, path, name)=> informer.innerHTML = `File "${body.name}" (${body.size}bytes) will be uploaded to <span id="pathSpan">${path? `"${path}"`:'root'}</span><span id="nameSpan">${name && name!=body.name? ` as "${name}"`:''}</span>`,
  reportcb: response => response.text().then(answer => console.log("Server answered: ", answer)),
  fetchArgs: (path, name, body)=> [path+'/'+name, {method: 'PUT', body}]
})
