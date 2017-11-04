const fs = require('fs')
const jsonParser = require('./jsonParser')
const {parseSpace, errors} = require('./common')
const db = '/home/nemo/GeekSkool/JS/keyValueStoreDB/db.json'

exports.listData = function (dbInput) {
  dbInput = parseSpace(dbInput.slice(7))
  let error = catchFileOpenError(db)
  if (error) return error
  let json = require(db)
  return [json, dbInput]
}

exports.insertData = function (dbInput) {
  dbInput = parseSpace(dbInput.slice(6))
  let res = getKeyValue(dbInput)
  let error = catchkeyValueError(res, 'insert')
  if (error) return error
  if (!fs.existsSync(db)) {
    return firstInsert(res)
  } else {
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
  dbInput = parseSpace(dbInput.slice(6))
  let error = catchFileOpenError(db)
  if (error) return error
  let res = getKeyValue(dbInput)
  error = catchkeyValueError(res, 'update')
  if (error) return error
  return (updateSimpleOrNestedKey(res)) ? ['Value updated', res[2]] : ['No such key found', res[2]]
}

function updateSimpleOrNestedKey (res) {
  let json = require(db), flag, keyArr = res[0].split('.')
  flag = (keyArr.length === 1) ? simpleKeyUpdate(json, res) : nestedKeyUpdate(json, res, keyArr)
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
  dbInput = parseSpace(dbInput.slice(6))
  let error = catchFileOpenError(db)
  if (error) return error
  let res = getKeyValue(dbInput)
  error = catchkeyValueError(res, 'delete')
  if (error) return error
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
  dbInput = parseSpace(dbInput.slice(4))
  let error = catchFileOpenError(db)
  if (error) return error
  let res = getKeyValue(dbInput)
  error = catchkeyValueError(res, 'show')
  if (error) return error
  let result = showSimpleOrNestedKey(res)
  return showSimpleOrNestedKey(res) ? [result, res[2]] : ['No such key found', res[2]]
}

function showSimpleOrNestedKey (res) {
  let json = require(db), keyArr = res[0].split('.')
  return (keyArr.length === 1) ? simpleKeyShow(json, res) : nestedKeyShow(json, res, keyArr)
}

function simpleKeyShow (json, res) {
  if (keyExists(res[0], json)) {
    return (json[res[0]])
  } else return false
}

function nestedKeyShow (obj, res, keyArr) {
  if (keyExists(keyArr[0], obj)) {
    if (keyArr.length === 1) {
      return (obj[keyArr[0]])
    } else if (keyArr.length > 1) {
      let flag = nestedKeyShow(obj[keyArr[0]], res, keyArr.slice(1))
      return flag
    }
  } else return false
}

function getKeyValue (dbInput) {
  let key = dbInput.split(' ')[0], value
  dbInput = parseSpace(dbInput.slice(key.length))
  if (dbInput) {
    value = jsonParser.parseJSON(dbInput)
    if (value !== 'Invalid Json') {
      dbInput = value[1]
    } else return value
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

function catchkeyValueError (res, command) {
  try {
    if (res === 'Invalid JSON') throw res
    else if (res[0] === '') throw errors[2]
    if (command === 'insert') if (res[1] === '') throw errors[3]
  } catch (err) {
    return err
  }
}

function catchFileOpenError (db) {
  try {
    if (!fs.existsSync(db)) throw errors[4]
  } catch (err) {
    return err
  }
}
