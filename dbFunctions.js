let jsonParser = require('./jsonParser.js')
let fs = require('fs')

exports.listData = function (dbInput) {
  dbInput = delSpace(dbInput.slice(7))
  let json = require('./db.json')
  for (let ob in json) {
    console.log(ob, ':', json[ob])
  }
  return [Object.keys(json).length + ' Items', dbInput]
}

exports.insertData = function (dbInput) {
  dbInput = delSpace(dbInput.slice(6))
  let res = getKeyValue(dbInput)
  if (!fs.existsSync('./db.json')) return firstInsert(res)
  else {
    let json = require('./db.json')
    if (!keyExists(res[0], json)) {
      return (insertSimpleOrNestedKey(res)) ? ['Data inserted', res[2]] : ['Error', res[2]]
    }
    else return ['Key already exists', res[2]]
  }
}

function firstInsert (res) {
  let json = {}
  fs.open('./db.json', 'w+', (err, fd) => {
    if (err) throw err
    else {
      json[res[0]] = res[1][0]
      writeData(json)
    }
  })
  return ['Data inserted', res[2]]
}

function insertSimpleOrNestedKey (res) {
  let json = require('./db.json'), flag = 0, keyArr = res[0].split('.')
  flag = (keyArr.length === 1) ? simpleKeyInsert(json, res) : nestedKeyInsert(json, res, keyArr)
  return flag
}

function simpleKeyInsert (json, res) {
  json[res[0]] = res[1][0]
  writeData(json)
  return 1
}

function nestedKeyInsert (obj, res, keyArr) {
  if (keyArr.length === 2) {
    let ob = obj[keyArr[0]]
    ob[keyArr[1]] = res[1][0]
    obj[keyArr[0]] = ob
    return 1
  }
  if (keyArr[0] in obj && keyArr.length > 2) {
    let flag = nestedKeyInsert(obj[keyArr[0]], res, keyArr.slice(1))
    writeData(obj)
    return flag
  }
}

exports.updateData = function (dbInput) {
  dbInput = delSpace(dbInput.slice(6))
  let res = getKeyValue(dbInput)
  return (updateSimpleOrNestedKey(res)) ? ['Value updated', res[2]] : ['No such key found', res[2]]
}

function updateSimpleOrNestedKey (res) {
  let json = require('./db.json'), flag = 0, keyArr = res[0].split('.')
  flag = (!/./.test(res[0])) ? simpleKeyUpdate(json, res) : nestedKeyUpdate(json, res, keyArr)
  return flag
}

function simpleKeyUpdate (json, res) {
  if (res[0] in json) {
    json[res[0]] = res[1][0]
    writeData(json)
    return 1
  }
  else return 0
}

function nestedKeyUpdate (obj, res, keyArr) {
  if (keyArr[0] in obj && keyArr.length === 1) {
    obj[keyArr[0]] = res[1][0]
    return 1
  }
  if (keyArr[0] in obj && keyArr.length > 1) {
    let flag = nestedKeyUpdate(obj[keyArr[0]], res, keyArr.slice(1))
    writeData(obj)
    return flag
  }
}

exports.deleteData = function (dbInput) {
  dbInput = delSpace(dbInput.slice(6))
  let res = getKeyValue(dbInput)
  return (deleteSimpleOrNestedKey(res)) ? ['Data deleted', res[2]] : ['No such key found', res[2]]
}

function deleteSimpleOrNestedKey (res) {
  let json = require('./db.json'), keyArr = res[0].split('.')
  let flag = (keyArr.length === 1) ? simpleKeyDelete(json, res) : nestedKeyDelete(json, res, keyArr)
  return flag
}

function simpleKeyDelete (json, res) {
  if (res[0] in json) {
    delete json[res[0]]
    writeData(json)
    return 1
  }
  else return 0
}

function nestedKeyDelete (obj, res, keyArr) {
  if (keyArr[0] in obj && keyArr.length === 1) {
    delete obj[keyArr[0]]
    return 1
  }
  if (keyArr[0] in obj && keyArr.length > 1) {
    let flag = nestedKeyDelete(obj[keyArr[0]], res, keyArr.slice(1))
    writeData(obj)
    return flag
  }
}

exports.showValue = function (dbInput) {
  dbInput = delSpace(dbInput.slice(4))
  let res = getKeyValue(dbInput)
  return showSimpleOrNestedKey(res) ? ['', res[2]] : ['No such key found', res[2]]
}

function showSimpleOrNestedKey (res) {
  let json = require('./db.json'), flag
  flag = (!/./.test(res[0])) ? showSimpleKey(json, res) : showNestedKey(json, res)
  return flag
}

function showSimpleKey (json, res) {
  for (let ob of json) {
    if (Object.keys(ob)[0] === res[0]) {
      console.log(ob[Object.keys(ob)[0]])
      return 1
    }
  }
}

function showNestedKey (json, res) {
  let keyArr = res[0].split('.'), obj = '', flag = 0
  // let key = res[0].slice(keyArr[0].length + 1)
  for (let ob of json) {
    if (Object.keys(ob)[0] === keyArr[0]) {
      obj = ob
      flag = 1
    }
  }
  for (let i = 0; i < keyArr.length; i++) obj = obj[keyArr[i]]
  console.log(obj)
  return flag
}

function getKeyValue (dbInput) {
  let key = dbInput.split(' ')[0], value
  dbInput = delSpace(dbInput.slice(key.length))
  if (dbInput) {
    value = jsonParser.parseJSON(dbInput.split(' ')[0])
    dbInput = delSpace(dbInput.slice(dbInput.split(' ')[0].length))
  }
  else value = ''
  return [key, value, dbInput]
}

function keyExists (key, obj) {
  return key in obj
}

function writeData (json) {
  fs.writeFile('db.json', JSON.stringify(json, null, 4), function (err) {
    if (err) throw err
  })
}

function delSpace (dbInput) {
  while (/\s/.test(dbInput[0])) dbInput = dbInput.slice(1)
  return dbInput
}
