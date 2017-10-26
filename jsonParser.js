exports.parseJSON = function (JSONInput) {
  let value = valueParsers(delSpace(JSONInput))
  return (value != null) ? value : 'Invalid Json'
}

let valueParsers = factoryParsers(parseNum, parseString, parseArray, parseObject)

function factoryParsers (...parsers) {
  return function (In) {
    let results = parsers.map((result, index, parsers) => { return result(In) })
    return results.filter((result) => { return result !== null })[0]
  }
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

function delSpace (dbInput) {
  while (/\s/.test(dbInput[0])) dbInput = dbInput.slice(1)
  return dbInput
}
