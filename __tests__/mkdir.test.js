require('c4console')
const {mkdir , remove} = require('../fs-glass.js')
// const mkdir =()=> Promise.resolve(1)
const fs = require('fs')


beforeAll(async ()=> {
  try { await remove('test_dir') } catch {}
})

test('mkdir exists', ()=> {
  expect(mkdir).toBeTruthy()
})

test('mkdir returns promise', ()=> {
  expect(mkdir('test_dir').constructor.name).toBe('Promise');
})

test('mkdir creates a folder', async ()=> {
  await mkdir('test_dir/folder')

  expect(()=> {
    const stats = fs.statSync('test_dir/folder')
    if (!stats.isDirectory()) throw 0
  }).not.toThrow()
})

test('mkdir')

// !создание папки по 'папка'
// !создание папки по 'папка/папка/папка'
// !создание папки по '/папка'
// !создание папки по './папка'
// !создание папки по 'папка/папка' когда такая уже есть
// !создание папки по 'папка/папка' когда есть и это файл
//


// afterAll()