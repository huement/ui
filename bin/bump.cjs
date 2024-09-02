#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const { textUI } = require( './tui.cjs' )
const updater = require( 'jsonfile-updater' )
const fs = require( 'fs' )

// Global Functions & Logic
const timeElapsed = Date.now()
const today = new Date( timeElapsed )

const packData = textUI.getParsedPackage()
let newNumber = packData.buildNumber
let newDate = today.toDateString()
// var stats = fs.statSync('dist/' + packData.codeName + '.css')
// var fileSizeInBytes = stats.size
// let newSize = textUI.formatBytes(fileSizeInBytes)
newNumber++ // Advance the local counter by one

// Each function is responsible for updating a specific value
// in the package.json file

function updateBuildNumber() {
    updater( './package.json' ).set( 'buildNumber', newNumber, function ( err ) {
        if ( err !== undefined ) {
            console.log( err )
            return
        }
        const pkg = textUI.getParsedPackage()
        textUI.statusTxt( `Latest Build Number: ${pkg.buildNumber}` )
        setTimeout( () => {
            // console.log('updateBuildDate()')
            updateBuildDate()
        }, '250' )
    } )
}

function updateBuildDate() {
    updater( './package.json' ).set( 'buildDate', newDate, function ( err ) {
        if ( err !== undefined ) {
            console.log( err )
            return
        }
        const pkg = textUI.getParsedPackage()
        textUI.statusTxt( `Latest Build Date: ${pkg.buildDate}` )
    } )
}

// Start off with one. Upon completion, the next function is called.
textUI.taskTxt( `${packData.name} package.json values updating...` )
updateBuildNumber()
