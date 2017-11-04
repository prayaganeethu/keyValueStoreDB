const readline = require('readline')
const kvs = require('./lib/keyValueStore')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

let recursiveAsyncReadLine = function () {
  rl.question('GeekDB > ', function (answer) {
    if (answer === 'exit') {
      return rl.close()
    }
    answer = kvs.keyValStore(answer)
    console.log(JSON.stringify(answer, null, 4))
    recursiveAsyncReadLine()
  })
}

recursiveAsyncReadLine()
