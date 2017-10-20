let fs = require('fs')

exports.keyValStore = function (dbInput) {
  if (dbInput) {
    let res
    while (delSpace(dbInput)) {
      res = dbOp(delSpace(dbInput))
      dbInput = res[1]
    }
    return res[0]
  }
  return null
}

let dbOp = factory(listAllObj, insertObj, deleteObj)

function factory (...parsers) {
  return function (In) {
    for (let i = 0; i < parsers.length; i++) {
      let result = parsers[i](In)
      if (result != null) return result
    }
    return null
  }
}

function listAllObj (dbInput) {
  if (dbInput.split(' ')[0] === 'listAll') {
    dbInput = delSpace(dbInput.slice(7))
    let json = require('./db.json')
    // let _ = require('lodash')
    for (let ob of json) console.log(Object.keys(ob)[0], ':', ob[Object.keys(ob)[0]])
    return ['********', dbInput]
  }
  return null
}

function insertObj (dbInput) {
  if (dbInput.slice(0, 6) === 'insert') {
    dbInput = delSpace(dbInput.slice(6))
    let dbObj = {}, dbArr = dbInput.split(' '), key = dbArr[0]
    dbInput = delSpace(dbInput.slice(key.length))
    dbArr = dbInput.split(' ')
    let value = dbArr[0]
    dbInput = delSpace(dbInput.slice(value.length))
    dbObj[key] = value
    let json = require('./db.json')
    json.push(dbObj)
    fs.writeFile('db.json', JSON.stringify(json, null, 4))
    return ['Data inserted', dbInput]
  }
  return null
}

function deleteObj (dbInput) {
  if (dbInput.slice(0, 6) === 'delete') {
    dbInput = delSpace(dbInput.slice(6))
    let dbArr = dbInput.split(' '), key = dbArr[0]
    console.log('key', key)
    dbInput = delSpace(dbInput.slice(key.length))
    let json = require('./db.json'), count = 0, flag = 0
    for (let ob of json) {
      if (ob === null) {
        count++
        continue
      }
      if (Object.keys(ob)[0] === key) {
        delete json[count]
        flag = 1
        break
      }
      count++
    }
    if (flag === 0) return null  // console.log(json)
    for (let i = 0; i < json.length; i++) {
      if (json[i] == null) json.splice(i, 1)
    }
    fs.writeFile('db.json', JSON.stringify(json, null, 4))
    return ['Data deleted', dbInput]
  }
  return null
}

function delSpace (dbInput) {
  while (/\s/.test(dbInput[0])) dbInput = dbInput.slice(1)
  return dbInput
}
