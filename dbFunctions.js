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
  if (!fs.existsSync('./db.json')) {
    let json = {}
    fs.open('./db.json', 'w+', (err, fd) => {
      if (err) throw err
      else {
        json[res[0]] = res[1][0]
        fs.writeFile('./db.json', JSON.stringify(json, null, 4))
      }
    })
    return ['Data inserted', res[2]]
  }
  else {
    let json = require('./db.json')
    if (!keyExists(res[0], json)) {
      json[res[0]] = res[1][0]
      fs.writeFile('./db.json', JSON.stringify(json, null, 4))
      return ['Data inserted', res[2]]
    }
    else return ['Key already exists', res[2]]
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
  writeData(json)
  return flag
}

function simpleKeyUpdate (json, res) {
  if (res[0] in json) {
    json[res[0]] = res[1][0]
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
    console.log('Heyy')
    return nestedKeyUpdate(obj[keyArr[0]], res, keyArr.slice(1))
  }
}

function insertNewNestedKey (ob, keyArr, res) {
  let arr = Object.keys(ob)
  let key = arr.filter((key, index, arr) => { return key === keyArr[keyArr.length - 2] })
  if (key) {
    let obj = ob[key[0]]
    obj[keyArr[keyArr.length - 1]] = res[1][0]
    ob[key[0]] = obj
    return 1
  } else {
    return 0
  }
}

function updateOldNestedKey (ob, keyArr, res) {
  let i
  for (i = 0; i < keyArr.length - 1; i++) ob = ob[keyArr[i]]
  ob[keyArr[i]] = res[1][0]
  return 1
}

exports.deleteData = function (dbInput) {
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

function initializeFile () {
  // let json = []
  // fs.open('./db.json', 'w+', (err, fd) => {
  //   if (err) throw err
  //   else {
  //     fs.writeFile('./test.json', JSON.stringify(json, null, 4), function (err) {
  //       if (err) throw err
  //       json = require('./db.json')
  //     })
  //   }
  // })
  return json
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
