exports.parseJSON = function (JSONInput) {
  if (JSONInput) {
    let res
    // while (JSONInput) {
    res = valueParsers(parseSpace(JSONInput))
    console.log(res)
    if (res !== null) JSONInput = res[1]
    else return 'Invalid Json'
    // }
    return res
  }
  return null
}

let valueParsers = factoryParsers(parseNull, parseBoolean, parseNum, parseString, parseArray, parseObject)

function factoryParsers (...parsers) {
  return function (In) {
    let results = parsers.map((result, index, parsers) => { return result(In) })
    let val = results.filter((result) => { return result !== null })[0]
    if (val) return val
    else return null
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
  value = parseSpace(value)
  let arr = [], val
  while (value[0] !== ']') {
    val = valueParsers(parseSpace(value))
    if (val == null) return null
    arr.push(val[0])
    value = val[1]
    if (parseComma(value) != null) {
      value = parseComma(value)
      if (value[0] === ']') return null
    } else if (parseSpace(value)[0] !== ']') return null
    value = parseSpace(value)
  }
  console.log('jhfjfj', arr)
  return [arr, value.slice(1)]
}

function parseObject (value) {
  if (value[0] !== '{') return null
  let obj = {}, strng, val, val1, val2
  value = value.slice(1)
  value = parseSpace(value)
  while (value[0] !== '}') {
    // console.log("HERE")
    val1 = parseString(parseSpace(value))
    if (val1 === null) return null
    strng = val1[0]
    if (parseColon(val1[1]) != null) value = parseColon(val1[1])
    else return null
    val2 = valueParsers(parseSpace(value))
    if (val2 == null) return null
    val = val2[0]
    obj[strng] = val
    // console.log(obj, val2[1][0])
    if (parseComma(val2[1]) != null) {
      val = parseComma(val2[1])
      if (val[0] === '}') return null
    } else if (parseSpace(val2[1])[0] !== '}') return null
    value = parseSpace(val2[1])
    // console.log("HERE VALUE", value)
  }
  console.log([obj, value.slice(1)])
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
  value = parseSpace(value)
  return (value[0] === ',') ? value.slice(1) : null
}

function parseColon (value) {
  value = parseSpace(value)
  return (value[0] === ':') ? value.slice(1) : null
}

exports.parseSpace = parseSpace

function parseSpace (dbInput) {
  while (/\s/.test(dbInput[0])) dbInput = dbInput.slice(1)
  return dbInput
}
