#!/usr/bin/env node

/**
 * @file Main Design Token generator. Execute imported sections
 * @description Generates all of the dynamic files for hui.
 *              Uses package.json file + others as inputs
 * @author Derek Scott <derek@huement.com>
 * @version 05/03/2022_09.25
 */

const { textUI } = require('./tui.cjs')
const fileMGMT = require('./filemgmt.cjs')
const TokenColors = require('./colors.cjs')
const TokenChords = require('./chords.cjs')
const TokenFonts = require('./fonts.cjs')
const _ = require('lodash')
const cg = require('../package.json')
const debugOutput = cg.debugMode || true
const { exec } = require('child_process')
const path = require('path')

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

// Display a cool banner message based on package.json data
textUI.outputHeader(cg)

const argv = yargs(hideBin(process.argv))
  .command('$0', 'Run one or more optimization commands', (yargs) => {
    return yargs
      .option('imgopt', {
        alias: 'i',
        description: 'Target directory for image optimization',
        type: 'string',
      })
      .option('color', {
        alias: 'c',
        description: 'Run color optimization',
        type: 'boolean',
        default: false,
      })
      .option('chords', {
        alias: 'd',
        description: 'Run design tokens (chords) optimization',
        type: 'boolean',
        default: false,
      })
      .option('data', {
        alias: 't',
        description: 'Run data optimization',
        type: 'boolean',
        default: false,
      })
      .check((argv) => {
        // Ensure at least one command is specified
        if (!argv.imgopt && !argv.color && !argv.chords && !argv.data) {
          throw new Error('At least one command must be specified')
        }
        // If imgopt is specified, ensure it has a value
        if (argv.imgopt === true) {
          throw new Error('imgopt requires a directory path')
        }
        return true
      })
  })
  .help().argv

// Get the target directory from the imgopt parameter if specified
const targetDir = argv.imgopt ? argv.imgopt : false
// TODO Optionally have a selectable menu allowing users to select which cmd to run

process.on('exit', function (code) {
  if (debugOutput) return console.log(`Exiting with code: ${code}`)
})

const colorList = 'tokens/color_tokens.json' // basic hex codes used to build theme from
const colorSCSS = 'scss/hui/_palette.scss' // SCSS file w/ tokens + generated color stacks
const colorJSON = 'dist/generated_colors.json' // List of all colors that were created
const scriptDir = __dirname
const bashScriptPath = path.join(scriptDir, 'web-image-optimize.sh')

const resultList = []

function sleep(ms) {
  console.log('SLEEPING!!')
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function init() {
  // TODO: By default running this script runs NO commands. Must pass a flag
  // Execute commands based on flags
  if (argv.color) {
    console.log('Running color optimization...')
    const tc = new TokenColors(colorList, colorSCSS, colorJSON)
    tc.assemblePalette()
    sleep(2000)
    tc.addDefaultSass()
    resultList.push('color')
  }

  if (argv.chords) {
    console.log('Running design tokens optimization...')
    // Design Token Chords
    // Pass in chords.json file path
    // let chordList = gdb.chordTokens
    const td = new TokenChords(cg.hui)
    td.assmebleChordTokens()
    // await sleep(2000)
    td.addDefaultTagsSass()
    resultList.push('chord')
  }

  if (argv.data) {
    console.log('Running data optimization...')
    const fm = new fileMGMT()
    fm.scssDataFile()
    resultList.push('data')
  }

  if (targetDir) {
    console.log(`Running image optimization on directory: ${targetDir}`)
    // Execute the web-image-optimize.sh script with the target directory

    const bashScriptPath = path.join(scriptDir, 'web-image-optimize.sh')
    // Optimize any .jpg, .jpeg, or .png images for use on the web
    textUI.infoTxt(`Optimizing Images In: ${targetDir}`)

    exec(`"${bashScriptPath}" ${targetDir}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing script: ${error}`)
        return
      }
      if (stderr) {
        console.error(`Script stderr: ${stderr}`)
        return
      }
      console.log(`Script output: ${stdout}`)
    })
    resultList.push('imgopt')
  }
}

// textUI.infoTxt( JSON.stringify( argv ) )
// return false

// const tf = new TokenFonts( 'fontPath', 'fontTarget' )
// tf.assembleFontFiles()
init()

if (resultList.length >= 1) {
  textUI.taskTxt(resultList.join(' ') + ' tasks ran')
} else {
  textUI.infoTxt('ZERO tasks ran')
}

// TODO: icon build
