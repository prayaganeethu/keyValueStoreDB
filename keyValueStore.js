let dbFunctions = require('./dbFunctions.js')

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
    let results = crud.map((op, index, crud) => { return op(In) })
    return results.filter((result) => { return result !== null })[0]
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

function delSpace (dbInput) {
  while (/\s/.test(dbInput[0])) dbInput = dbInput.slice(1)
  return dbInput
}
