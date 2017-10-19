let fs = require('fs')
let dbInput = ''

fs.appendFile('db.json', dbInput, (err) => {
  if (err) throw err
  else console.log('GeekDB updated!')
})

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

let dbOp = factory(insertObj)

function factory (...parsers) {
  return function (In) {
    for (let i = 0; i < parsers.length; i++) {
      let result = parsers[i](In)
      if (result != null) return result
    }
    return null
  }
}

function insertObj (dbInput) {
  if (dbInput.slice(0, 6) === 'insert') {
    dbInput = delSpace(dbInput.slice(6))
    let dbObj = {}
    let dbArr = dbInput.split(' ')
    let key = dbArr[0]
    dbInput = delSpace(dbInput.slice(key.length))
    dbArr = dbInput.split(' ')
    let value = dbArr[0]
    dbInput = delSpace(dbInput.slice(value.length))
    dbObj[key] = value
    fs.appendFile('db.json', JSON.stringify(dbObj, null, 4), (err) => {
      if (err) throw err
    })
    fs.appendFile('db.json', '\n', (err) => {
      if (err) throw err
    })
    return ['Data inserted', dbInput]
  }
  return null
}

function delSpace (dbInput) {
  while (/\s/.test(dbInput[0])) dbInput = dbInput.slice(1)
  return dbInput
}
