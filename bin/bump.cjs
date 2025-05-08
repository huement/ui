const { textUI } = require('./tui.cjs')
const updater = require('jsonfile-updater')
const fs = require('fs')

// Global Functions & Logics
const timeElapsed = Date.now()
const today = new Date(timeElapsed)

const packData = textUI.getParsedPackage()
let newNumber = packData.buildNumber
let newDate = today.toDateString()
var stats = fs.statSync('dist/ui.css')
var fileSizeInBytes = stats.size
let newSize = textUI.formatBytes(fileSizeInBytes)
newNumber++ // Advance the local counter by one

// Each function is responsible for updating a specific value
// in the package.json file

function updateBuildSize() {
  updater('./package.json').set('buildSize', newSize, function (err) {
    if (err !== undefined) {
      console.log(err)
      return
    }
    const pkg = textUI.getParsedPackage()
    textUI.statusTxt(`Latest Build Size: ${pkg.buildSize}`)
    setTimeout(() => {
      // console.log('updateBuildNumber()')
      updateBuildNumber()
    }, '250')
  })
}

function updateBuildNumber() {
  updater('./package.json').set('buildNumber', newNumber, function (err) {
    if (err !== undefined) {
      console.log(err)
      return
    }
    const pkg = textUI.getParsedPackage()
    textUI.statusTxt(`Latest Build Number: ${pkg.buildNumber}`)
    setTimeout(() => {
      // console.log('updateBuildDate()')
      updateBuildDate()
    }, '250')
  })
}

function updateBuildDate() {
  updater('./package.json').set('buildDate', newDate, function (err) {
    if (err !== undefined) {
      console.log(err)
      return
    }
    const pkg = textUI.getParsedPackage()
    textUI.statusTxt(`Latest Build Date: ${pkg.buildDate}`)
  })
}

// Start off with one. Upon completion, the next function is called.
textUI.taskTxt(`${packData.name} package.json values updating...`)
updateBuildSize()
