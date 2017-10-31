let fs = require('fs')
let jsonParser = require('./jsonParser.js')
const db = './db.json'

exports.listData = function (dbInput) {
  dbInput = jsonParser.delSpace(dbInput.slice(7))
  let json = require(db)
  for (let ob in json) {
    console.log(ob, ':', json[ob])
  }
  return [Object.keys(json).length + ' Items', dbInput]
}

exports.insertData = function (dbInput) {
  dbInput = jsonParser.delSpace(dbInput.slice(6))
  let res = getKeyValue(dbInput)
  if (!fs.existsSync(db)) return firstInsert(res)
  else {
    let json = require(db)
    if (!keyExists(res[0], json)) {
      return (insertSimpleOrNestedKey(res)) ? ['Data inserted', res[2]] : ['Error', res[2]]
    } else return ['Key already exists', res[2]]
  }
}

function firstInsert (res) {
  let json = {}
  fs.open(db, 'w+', (err, fd) => {
    if (err) throw err
    else {
      json[res[0]] = res[1][0]
      writeData(json)
    }
  })
  return ['Data inserted', res[2]]
}

function insertSimpleOrNestedKey (res) {
  let json = require(db), flag, keyArr = res[0].split('.')
  flag = (keyArr.length === 1) ? simpleKeyInsert(json, res) : nestedKeyInsert(json, res, keyArr)
  return flag
}

function simpleKeyInsert (json, res) {
  json[res[0]] = res[1][0]
  writeData(json)
  return true
}

function nestedKeyInsert (obj, res, keyArr) {
  if (keyArr.length === 2) {
    let ob = obj[keyArr[0]]
    if (!keyExists(keyArr[1], ob)) {
      ob[keyArr[1]] = res[1][0]
      obj[keyArr[0]] = ob
      writeData(obj)
      return true
    } else return false
  }
  if (keyExists(keyArr[0], obj) && keyArr.length > 2) {
    let flag = nestedKeyInsert(obj[keyArr[0]], res, keyArr.slice(1))
    writeData(obj)
    return flag
  }
}

exports.updateData = function (dbInput) {
  dbInput = jsonParser.delSpace(dbInput.slice(6))
  let res = getKeyValue(dbInput)
  return (updateSimpleOrNestedKey(res)) ? ['Value updated', res[2]] : ['No such key found', res[2]]
}

function updateSimpleOrNestedKey (res) {
  let json = require(db), flag, keyArr = res[0].split('.')
  flag = (!/./.test(res[0])) ? simpleKeyUpdate(json, res) : nestedKeyUpdate(json, res, keyArr)
  return flag
}

function simpleKeyUpdate (json, res) {
  if (!keyExists(res[0], json)) return false
  else {
    json[res[0]] = res[1][0]
    writeData(json)
    return true
  }
}

function nestedKeyUpdate (obj, res, keyArr) {
  if (keyExists(keyArr[0], obj)) {
    if (keyArr.length === 1) {
      obj[keyArr[0]] = res[1][0]
      return true
    } else if (keyArr.length > 1) {
      let flag = nestedKeyUpdate(obj[keyArr[0]], res, keyArr.slice(1))
      writeData(obj)
      return flag
    }
  } else return false
}

exports.deleteData = function (dbInput) {
  dbInput = jsonParser.delSpace(dbInput.slice(6))
  let res = getKeyValue(dbInput)
  return (deleteSimpleOrNestedKey(res)) ? ['Data deleted', res[2]] : ['No such key found', res[2]]
}

function deleteSimpleOrNestedKey (res) {
  let json = require(db), keyArr = res[0].split('.')
  let flag = (keyArr.length === 1) ? simpleKeyDelete(json, res) : nestedKeyDelete(json, res, keyArr)
  return flag
}

function simpleKeyDelete (json, res) {
  if (!keyExists(res[0], json)) return false
  else {
    delete json[res[0]]
    writeData(json)
    return true
  }
}

function nestedKeyDelete (obj, res, keyArr) {
  if (keyExists(keyArr[0], obj)) {
    if (keyArr.length === 1) {
      if (obj.length) obj.splice(keyArr[0], 1)
      else delete obj[keyArr[0]]
      return true
    } else if (keyArr.length > 1) {
      let flag = nestedKeyDelete(obj[keyArr[0]], res, keyArr.slice(1))
      writeData(obj)
      return flag
    }
  } else return false
}

exports.showValue = function (dbInput) {
  dbInput = jsonParser.delSpace(dbInput.slice(4))
  let res = getKeyValue(dbInput)
  return showSimpleOrNestedKey(res) ? ['Key exists', res[2]] : ['No such key found', res[2]]
}

function showSimpleOrNestedKey (res) {
  let json = require(db), keyArr = res[0].split('.')
  let flag = (keyArr.length === 1) ? simpleKeyShow(json, res) : nestedKeyShow(json, res, keyArr)
  return flag
}

function simpleKeyShow (json, res) {
  if (keyExists(res[0], json)) {
    console.log(json[res[0]])
    return true
  } else return false
}

function nestedKeyShow (obj, res, keyArr) {
  if (keyExists(keyArr[0], obj)) {
    if (keyArr.length === 1) {
      console.log(obj[keyArr[0]])
      return true
    } else if (keyArr.length > 1) {
      let flag = nestedKeyShow(obj[keyArr[0]], res, keyArr.slice(1))
      return flag
    }
  } else return false
}

function getKeyValue (dbInput) {
  let key = dbInput.split(' ')[0], value
  dbInput = jsonParser.delSpace(dbInput.slice(key.length))
  if (dbInput) {
    value = jsonParser.parseJSON(dbInput)
    dbInput = value[1]
  } else value = ''
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
