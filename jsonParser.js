exports.parseJSON = function (JSONInput) {
  let value = valueParsers(deleteSpace(JSONInput))
  return (value != null) ? value : 'Invalid Json'
}

let valueParsers = factoryParsers(parseNull, parseBoolean, parseNum, parseString, parseArray, parseObject)

function factoryParsers (...parsers) {
  return function (In) {
    let results = parsers.map((result, index, parsers) => { return result(In) })
    return results.filter((result) => { return result !== null })[0]
  }
}

function parseNull (JSONInput) {
  return (JSONInput.slice(0, 4) === 'null') ? [null, JSONInput.slice(4)] : null
}

function parseBoolean (JSONInput) {
  return (JSONInput.slice(0, 4) === 'true') ? [true, JSONInput.slice(4)] : ((JSONInput.slice(0, 5) === 'false') ? [false, JSONInput.slice(5)] : null)
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
  value = deleteSpace(value)
  let arr = [], val
  while (value[0] !== ']') {
    val = valueParsers(deleteSpace(value))
    if (val == null) return null
    arr.push(val[0])
    value = (parseComma(val[1]) != null) ? parseComma(val[1]) : val[1]
    value = deleteSpace(value)
  }
  return [arr, value.slice(1)]
}

function parseObject (value) {
  if (value[0] !== '{') return null
  let obj = {}, strng, val, val1, val2
  value = value.slice(1)
  value = deleteSpace(value)
  while (value[0] !== '}') {
    val1 = parseString(deleteSpace(value))
    if (val1 === null) return null
    strng = val1[0]
    value = (parseColon(val1[1]) != null) ? parseColon(val1[1]) : val1[1]
    val2 = valueParsers(deleteSpace(value))
    if (val2 == null) return null
    val = val2[0]
    obj[strng] = val
    val = (parseComma(val2[1]) != null) ? parseComma(val2[1]) : val2[1]
    value = deleteSpace(val)
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
  value = deleteSpace(value)
  return (value[0] === ',') ? value.slice(1) : null
}

function parseColon (value) {
  value = deleteSpace(value)
  return (value[0] === ':') ? value.slice(1) : null
}

exports.delSpace = deleteSpace

function deleteSpace (dbInput) {
  while (/\s/.test(dbInput[0])) dbInput = dbInput.slice(1)
  return dbInput
}
