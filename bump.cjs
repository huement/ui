const updater = require('jsonfile-updater')

const fs = require('fs')
function getParsedPackage() {
  return JSON.parse(fs.readFileSync('./package.json'))
}

const packData = getParsedPackage()
let newNumber = packData.buildNumber
newNumber++

updater('./package.json').set('buildNumber', newNumber, function (err) {
  if (err !== undefined) { console.log(err); return }
  const pkg = getParsedPackage()
  console.log(pkg.buildNumber)
})
