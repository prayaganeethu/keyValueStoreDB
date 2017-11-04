function parseSpace (dbInput) {
  while (/\s/.test(dbInput[0])) dbInput = dbInput.slice(1)
  return dbInput
}

const errors = ['Invalid Json', 'Invalid Command', 'Please enter a key', 'Please enter a value', 'No data available. Please insert and proceed']

module.exports = {parseSpace, errors}
