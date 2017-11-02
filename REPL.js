const readline = require('readline')
const kvs = require('./lib/keyValueStore.js')

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
    rl.write(JSON.stringify(answer, null, 4))
    setTimeout(recursiveAsyncReadLine, 4000)
  })
}

recursiveAsyncReadLine()
