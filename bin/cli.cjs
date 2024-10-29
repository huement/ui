#!/usr/bin/env node

/**
 * @file Main Design Token generator. Execute imported sections
 * @description Generates all of the dynamic files for hui. Using the package.json file and some .env values as its inputs.
 * @author Derek Scott <derek@huement.com>
 * @version 05/03/2022_09.25
 */

const { textUI } = require( './tui.cjs' )
const { fileMGMT } = require( './filemgmt.cjs' )
const TokenColors = require( './colors.cjs' )
const TokenFonts = require( './fonts.cjs' )
const _ = require( 'lodash' )
const cg = require( '../package.json' )
const debugOutput = cg.debugMode || true

const yargs = require( 'yargs/yargs' )
const { hideBin } = require( 'yargs/helpers' )
const argv = yargs( hideBin( process.argv ) ).argv

// TODO Add in package handling such as install dependencies?
// TODO Use Args to choose what happens when this script is called.
// TODO Optionally have a selectable menu allowing users to select which cmd to run

process.on( 'exit', function ( code ) {
    return console.log( `Exiting with code: ${code}` )
} )

// Display a cool banner message based on package.json data
textUI.outputHeader( cg )

let colorList = 'tokens/color_tokens.json'
let colorSCSS = 'scss/config/_palette-test.scss'

const resultList = []

// TODO: By default running this script runs all the commands,
//       but if ANY flag is present, then it only runs that specific command
//       This example below is a workable template
if ( argv[ '_' ] && argv[ '_' ][ 0 ] ) {
    for ( let i = 0; i < argv[ '_' ].length; i++ ) {
        const theCmd = _.trim( argv[ '_' ][ i ] )
        textUI.infoTxt( 'Input Command: ' + theCmd )

        if ( theCmd === 'color' || theCmd === 'colors' ) {
            const tc = new TokenColors( colorList, colorSCSS )
            tc.assemblePalette()
            tc.addDefaultSass()
            resultList.push( 'color' )
        }

        if ( theCmd === 'chord' || theCmd === 'chords' ) {
            // Design Token Chords
            // Pass in chords.json file path
            // let chordList = gdb.chordTokens
            const td = new TokenChords( '../tokens/gdb.json' )
            td.assmebleChordTokens()
            resultList.push( 'chord' )
        }
    }

} else {
    if ( debugOutput ) {
        textUI.infoTxt( 'Command Argv not found' )
    }
}

// textUI.infoTxt( JSON.stringify( argv ) )
// return false



// const tf = new TokenFonts( 'fontPath', 'fontTarget' )
// tf.assembleFontFiles()

if ( resultList.length < 1 ) {
    textUI.infoTxt( 'Command NOT FOUND. Nothing to do.' )
} else {
    textUI.taskTxt( resultList.join( ' ' ) + ' tasks ran' )
}

// TODO: icon build
