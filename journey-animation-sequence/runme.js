const open = require('open')

const gender = process.argv[2]
const stage = process.argv[3]

console.log(`16:9 ->  http://localhost:5500?gender=${gender}&stage=${stage}&prod=true`)
console.log(`square ->  http://localhost:5500?gender=${gender}&stage=${stage}&square=true&prod=true`)