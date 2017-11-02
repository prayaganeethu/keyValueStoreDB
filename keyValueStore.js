let dbFunctions = require('./dbFunctions.js')
let jsonParser = require('./jsonParser.js')

exports.keyValStore = function (dbInput) {
  if (dbInput) {
    let res
    while (dbInput) {
      res = dbOp(jsonParser.delSpace(dbInput))
      if (res !== 'Invalid Json' && res !== 'Invalid Command') dbInput = res[1]
      else return res
    }
    return res[0]
  }
  return null
}

let dbOp = factory(ifList, ifInsert, ifUpdate, ifDelete, ifShowSpecificKey)

function factory (...crud) {
  return function (In) {
    let results = crud.map((op, index, crud) => { return op(In) })
    let val = results.filter((result) => { return result !== null })[0]
    if (val) return val
    else return 'Invalid Command'
  }
}

function ifList (dbInput) {
  return (dbInput.split(' ')[0] === 'listAll') ? dbFunctions.listData(dbInput) : null
}

function ifInsert (dbInput) {
  return (dbInput.split(' ')[0] === 'insert') ? dbFunctions.insertData(dbInput) : null
}

function ifUpdate (dbInput) {
  return (dbInput.split(' ')[0] === 'update') ? dbFunctions.updateData(dbInput) : null
}

function ifDelete (dbInput) {
  return (dbInput.split(' ')[0] === 'delete') ? dbFunctions.deleteData(dbInput) : null
}

function ifShowSpecificKey (dbInput) {
  return (dbInput.split(' ')[0] === 'show') ? dbFunctions.showValue(dbInput) : null
}
