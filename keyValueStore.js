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

let dbOp = factory(listAllObj, insertObj, updateObj, deleteObj, showValue)

function factory (...crud) {
  return function (In) {
    for (let i = 0; i < crud.length; i++) {
      let result = crud[i](In)
      if (result != null) return result
    }
    return null
  }
}

let valueParsers = factoryParsers(parseNum, parseString, parseArray, parseObject)

function factoryParsers (...parsers) {
  return function (In) {
    for (let i = 0; i < parsers.length; i++) {
      let result = parsers[i](In)
      if (result != null) return result
    }
    return null
  }
}

function listAllObj (dbInput) {
  let count = 0, msg = ''
  if (dbInput.split(' ')[0] === 'listAll') {
    console.log('listAll')
    dbInput = delSpace(dbInput.slice(7))
    let json = require('./db.json')
    for (let ob of json) {
      console.log(Object.keys(ob)[0], ':', ob[Object.keys(ob)[0]])
      count++
    }
    msg += count + ' Items'
    return [msg, dbInput]
  }
  return null
}

function insertObj (dbInput) {
  let flag = 0
  if (dbInput.split(' ')[0] === 'insert') {
    console.log('insert', dbInput)
    let json = []
    dbInput = delSpace(dbInput.slice(6))
    let dbObj = {}, dbArr = dbInput.split(' '), key = dbArr[0]
    dbInput = delSpace(dbInput.slice(key.length))
    let value = valueParsers(dbInput)
    dbInput = delSpace(value[1])
    dbObj[key] = value[0]
    if (!fs.existsSync('./db.json')) {
      fs.open('./db.json', 'w+', (err, fd) => {
        if (err) throw err
        else {
          fs.writeFile('./test.json', JSON.stringify(json, null, 4), function (err) {
            if (err) throw err
            json = require('./db.json')
          })
        }
      })
    }
    else {
      json = require('./db.json')
      for (let ob of json) {
        if (Object.keys(ob)[0] === key) {
          flag = 1
        }
      }
    }
    if (flag === 0) {
      json.push(dbObj)
      fs.writeFile('db.json', JSON.stringify(json, null, 4))
      return ['Data inserted', dbInput]
    }
    else return ['Key already exists', dbInput]
  }
  return null
}

function updateObj (dbInput) {
  if (dbInput.split(' ')[0] === 'update') {
    console.log('update')
    dbInput = delSpace(dbInput.slice(6))
    let key = dbInput.split(' ')[0]
    dbInput = delSpace(dbInput.slice(key.length))
    let value = valueParsers(dbInput.split(' ')[0])
    dbInput = delSpace(dbInput.slice(dbInput.split(' ')[0].length))
    let json = require('./db.json'), flag = 0
    if (!/./.test(key)) {
      for (let ob of json) {
        if (Object.keys(ob)[0] === key) {
          ob[key] = value[0]
          flag = 1
        }
      }
    }
    else {
      let keyArr = key.split('.'), i
      key = key.slice(keyArr[0].length + 1)
      for (let ob of json) {
        if ((Object.keys(ob).length === keyArr.length - 1) && (Object.keys(ob)[0] === keyArr[0])) {
          console.log('HOLA', Object.keys(ob).length, keyArr.length)
          for (i = 0; i < Object.keys(ob).length - 1; i++) ob = ob[Object.keys(ob)[i]]
          console.log('ob', ob)
          ob[keyArr[keyArr.length - 2]][keyArr[keyArr.length - 1]] = value[0]
          flag = 1
        }
        else if ((Object.keys(ob).length === keyArr.length) && (Object.keys(ob)[0] === keyArr[0])) {
          for (i = 0; i < keyArr.length - 1; i++) ob = ob[keyArr[i]]
          ob[keyArr[i]] = value[0]
          flag = 1
        }
      }
    }

    if (flag === 1) {
      fs.writeFile('db.json', JSON.stringify(json, null, 4))
      return ['Value updated', dbInput]
    }
    return ['No such key found', dbInput]
  }
  return null
}

function deleteObj (dbInput) {
  if (dbInput.split(' ')[0] === 'delete') {
    console.log('delete')
    dbInput = delSpace(dbInput.slice(6))
    let dbArr = dbInput.split(' '), key = dbArr[0]
    dbInput = delSpace(dbInput.slice(key.length))
    let json = require('./db.json'), count = 0, flag = 0
    if (!(/./.test(key))) {
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
    }
    else {
      let keyArr = key.split('.'), count = 0
      key = key.slice(keyArr[0].length + 1)
      for (let ob of json) {
        if (Object.keys(ob)[0] === keyArr[0]) {
          for (let i = 0; i < keyArr.length; i++) {
            if (i === keyArr.length - 1) {
              delete ob[keyArr[i]]
              flag = 1
              break
            }
            ob = ob[keyArr[i]]
          }
        }
        count++
      }
    }
    if (flag === 0) return ['No such key found', dbInput]
    for (let i = 0; i < json.length; i++) {
      if (Object.keys(json[i]).length === 0) json.splice(i, 1)
    }
    fs.writeFile('db.json', JSON.stringify(json, null, 4))
    return ['Data deleted', dbInput]
  }
  return null
}

function showValue (dbInput) {
  if (dbInput.split(' ')[0] === 'show') {
    console.log('show')
    let res = ''
    dbInput = delSpace(dbInput.slice(4))
    let key = dbInput.split(' ')[0]
    dbInput = delSpace(dbInput.slice(key.length))
    let json = require('./db.json')
    if (!/./.test(key)) {
      for (let ob of json) {
        if (Object.keys(ob)[0] === key) console.log(ob[Object.keys(ob)[0]])
      }
    }
    else {
      let keyArr = key.split('.'), obj = ''
      key = key.slice(keyArr[0].length + 1)
      for (let ob of json) {
        if (Object.keys(ob)[0] === keyArr[0]) {
          obj = ob
        }
      }
      for (let i = 0; i < keyArr.length; i++) obj = obj[keyArr[i]]
      console.log(obj)
    }
    return ['', dbInput]
  }
  return null
}

function delSpace (dbInput) {
  while (/\s/.test(dbInput[0])) dbInput = dbInput.slice(1)
  return dbInput
}

function parseNum (value) {
  let match = /^[-+]?[0-9]+(.[0-9]+([eE][-+]?[0-9]+)?)?/.exec(value), numb = '', i
  if (match == null || match.index !== 0) return null
  for (i = match.index; /[-+0-9.eE]/.test(value[i]) && value[i] !== undefined; i++) numb += value[i].toString()
  return [parseFloat(numb), value.slice(i)]
}

function parseArray (value) {
  if (value[0] !== '[') return null
  value = value.slice(1)
  value = delSpace(value)
  let arr = [], val
  while (value[0] !== ']') {
    val = valueParsers(delSpace(value))
    if (val == null) return null
    arr.push(val[0])
    value = (parseComma(val[1]) != null) ? parseComma(val[1]) : val[1]
    value = delSpace(value)
  }
  return [arr, value.slice(1)]
}

function parseObject (value) {
  if (value[0] !== '{') return null
  let obj = {}, strng, val, val1, val2
  value = value.slice(1)
  value = delSpace(value)
  while (value[0] !== '}') {
    val1 = parseString(delSpace(value))
    if (val1 === null) return null
    strng = val1[0]
    value = (parseColon(val1[1]) != null) ? parseColon(val1[1]) : val1[1]
    val2 = valueParsers(delSpace(value))
    if (val2 == null) return null
    val = val2[0]
    obj[strng] = val
    val = (parseComma(val2[1]) != null) ? parseComma(val2[1]) : val2[1]
    value = delSpace(val)
  }
  return [obj, value.slice(1)]
}

function parseString (value) {
  let string = '', i = 1
  if (value[0] !== '"') return null
  while (true) {
    if (value[i - 1] !== '\\' && value[i] === '"') break
    string += value[i]
    i++
  }
  return [string, value.slice(i + 1)]
}

function parseComma (value) {
  value = delSpace(value)
  return (value[0] === ',') ? value.slice(1) : null
}

function parseColon (value) {
  value = delSpace(value)
  return (value[0] === ':') ? value.slice(1) : null
}
