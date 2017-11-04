const dbFunctions = require('./dbFunctions')
const {parseSpace, errors} = require('./common')

exports.keyValStore = function (dbInput) {
  if (dbInput) {
    let res
    while (dbInput) {
      res = dbOp(parseSpace(dbInput))
      if (errors.includes(res)) {
        return res
      } else dbInput = res[1]
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
    else return errors[1]
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
