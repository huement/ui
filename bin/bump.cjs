#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const { textUI } = require('./tui.cjs')
const updater = require('jsonfile-updater')
const fs = require('fs')

// Global Functions & Logic
function getParsedPackage() {
    return JSON.parse(fs.readFileSync('./package.json'))
}

function formatBytes(a, b = 2) {
    if (!+a) return '0 Bytes'
    const c = 0 > b ? 0 : b,
        d = Math.floor(Math.log(a) / Math.log(1024))
    return `${parseFloat((a / Math.pow(1024, d)).toFixed(c))} ${['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'][d]}`
}

const timeElapsed = Date.now()
const today = new Date(timeElapsed)

const packData = getParsedPackage()
let newNumber = packData.buildNumber
let newDate = today.toDateString()
var stats = fs.statSync('dist/' + packData.codeName + '.css')
var fileSizeInBytes = stats.size
let newSize = formatBytes(fileSizeInBytes)
newNumber++ // Advance the local counter by one

// Each function is responsible for updating a specific value
// in the package.json file

function updateBuildSize() {
    updater('./package.json').set('buildSize', newSize, function (err) {
        if (err !== undefined) {
            console.log(err)
            return
        }
        const pkg = getParsedPackage()
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
        const pkg = getParsedPackage()
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
        const pkg = getParsedPackage()
        textUI.statusTxt(`Latest Build Date: ${pkg.buildDate}`)
    })
}

// Start off with one. Upon completion, the next function is called.
textUI.taskTxt(`${packData.name} package.json values updating...`)
updateBuildSize()
