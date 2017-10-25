let fs = require('fs')
let jsonParser = require('./jsonParser.js')

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

let dbOp = factory(ifList, ifInsert, ifUpdate, ifDelete, ifShowSpecificKey)

function factory (...crud) {
  return function (In) {
    for (let i = 0; i < crud.length; i++) {
      let result = crud[i](In)
      if (result != null) return result
    }
    return null
  }
}

function ifList (dbInput) {
  return (dbInput.split(' ')[0] === 'listAll') ? listData(dbInput) : null
}

function listData (dbInput) {
  let count = 0, msg = ''
  dbInput = delSpace(dbInput.slice(7))
  let json = require('./db.json')
  for (let ob of json) {
    console.log(Object.keys(ob)[0], ':', ob[Object.keys(ob)[0]])
    count++
  }
  msg += count + ' Items'
  return [msg, dbInput]
}

function ifInsert (dbInput) {
  return (dbInput.split(' ')[0] === 'insert') ? insertData(dbInput) : null
}

function insertData (dbInput) {
  dbInput = delSpace(dbInput.slice(6))
  let json, dbObj = {}, res = getKeyValue(dbInput)
  dbObj[res[0]] = res[1][0]
  if (!fs.existsSync('./db.json')) json = initializeFile()
  json = require('./db.json')
  if (!keyExists(res[0])) {
    json.push(dbObj)
    writeData(json)
    return ['Data inserted', res[2]]
  }
  else return ['Key already exists', res[2]]
}

function ifUpdate (dbInput) {
  return (dbInput.split(' ')[0] === 'update') ? updateData(dbInput) : null
}

function updateData (dbInput) {
  dbInput = delSpace(dbInput.slice(6))
  let res = getKeyValue(dbInput)
  return (updateSimpleOrNestedKey(res)) ? ['Value updated', res[2]] : ['No such key found', res[2]]
}

function updateSimpleOrNestedKey (res) {
  let json = require('./db.json'), flag = 0
  flag = (!/./.test(res[0])) ? simpleKeyUpdate(json, res) : nestedKeyUpdate(json, res)
  writeData(json)
  return flag
}

function simpleKeyUpdate (json, res) {
  for (let ob of json) {
    if (Object.keys(ob)[0] === res[0]) {
      ob[res[0]] = res[1][0]
      return 1
    }
  }
}

function nestedKeyUpdate (json, res) {
  let keyArr = res[0].split('.'), flag = 0
  // let key = res[0].slice(keyArr[0].length + 1)
  for (let ob of json) {
    if ((Object.keys(ob).length === keyArr.length - 1) && (Object.keys(ob)[0] === keyArr[0])) {
      flag = insertNewNestedKey(ob, keyArr, res)
    }
    else if ((Object.keys(ob).length === keyArr.length) && (Object.keys(ob)[0] === keyArr[0])) {
      flag = updateOldNestedKey(ob, keyArr, res)
    }
  }
  return flag
}

function insertNewNestedKey (ob, keyArr, res) {
  for (let i = 0; i < Object.keys(ob).length - 1; i++) ob = ob[Object.keys(ob)[i]]
  console.log('ob', ob)
  ob[keyArr[keyArr.length - 2]][keyArr[keyArr.length - 1]] = res[1][0]
  return 1
}

function updateOldNestedKey (ob, keyArr, res) {
  let i
  for (i = 0; i < keyArr.length - 1; i++) ob = ob[keyArr[i]]
  ob[keyArr[i]] = res[1][0]
  return 1
}

function ifDelete (dbInput) {
  return (dbInput.split(' ')[0] === 'delete') ? deleteData(dbInput) : null
}

function deleteData (dbInput) {
  dbInput = delSpace(dbInput.slice(6))
  let res = getKeyValue(dbInput)
  return (deleteSimpleOrNestedKey(res)) ? ['Data deleted', res[2]] : ['No such key found', res[2]]
}

function deleteSimpleOrNestedKey (res) {
  let json = require('./db.json')
  let flag = (!(/./.test(res[0]))) ? deleteSimpleKey(json, res) : deleteNestedKey(json, res)
  return flag
}

function deleteSimpleKey (json, res) {
  let count = 0, flag = 0
  for (let ob of json) {
    if (ob === null) {
      count++
      continue
    }
    if (Object.keys(ob)[0] === res[0]) {
      delete json[count]
      flag = 1
      json = purgeJson(json)
      writeData(json)
      break
    }
    count++
  }
  return flag
}

function deleteNestedKey (json, res) {
  let keyArr = res[0].split('.'), flag = 0
  // let key = res[0].slice(keyArr[0].length + 1)
  for (let ob of json) {
    if (Object.keys(ob)[0] === keyArr[0]) {
      for (let i = 0; i < keyArr.length; i++) {
        if (i === keyArr.length - 1) {
          delete ob[keyArr[i]]
          flag = 1
          json = purgeJson(json)
          writeData(json)
          break
        }
        ob = ob[keyArr[i]]
      }
    }
  }
  return flag
}

function purgeJson (json) {
  for (let i = 0; i < json.length; i++) if (Object.keys(json[i]).length === 0) json.splice(i, 1)
  return json
}

function ifShowSpecificKey (dbInput) {
  return (dbInput.split(' ')[0] === 'show') ? showValue(dbInput) : null
}

function showValue (dbInput) {
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

function initializeFile () {
  let json = []
  fs.open('./db.json', 'w+', (err, fd) => {
    if (err) throw err
    else {
      fs.writeFile('./test.json', JSON.stringify(json, null, 4), function (err) {
        if (err) throw err
        json = require('./db.json')
      })
    }
  })
  return json
}

function keyExists (key) {
  let json = require('./db.json'), flag = 0
  for (let ob of json) if (Object.keys(ob)[0] === key) flag = 1
  return flag
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
