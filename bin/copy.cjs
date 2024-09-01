#!/usr/bin/env node
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const { textUI } = require('./tui.cjs')
const copy = require('recursive-copy')
const c = require('ansi-colors')
const jetpack = require('fs-jetpack')
const replace = require('replace-in-file')

// Global Functions & Logic
const packData = textUI.getParsedPackage()
const options = {
    overwrite: true,
    expand: true,
    dot: true,
    junk: false,
}

const replaceFileString = async function (fileName) {
    const replaceOptions = {
        files: fileName,
        from: /#REPLACE#/g,
        to: Math.floor(Date.now() / 1000),
    }

    try {
        const results = await replace(replaceOptions)
        console.log('Replacement results:', results)
    } catch (error) {
        console.error('Error occurred:', error)
    }
}

const replaceLoop = async function () {
    const replaceFiles = [
        'dist/javascript.html',
        'dist/theme.html',
        'dist/navmenu.html',
    ]
    replaceFiles.forEach(async (element) => {
        await replaceFileString(element)
    })
}

copy('public', 'dist', options)
    .then(function (results) {
        console.log('\n')
        textUI.taskTxt('COPIED ' + results.length + ' FILES')
        console.log('\n')
        replaceLoop()
    })
    .catch(function (error) {
        textUI.errorTxt(c.red.bold('COPY FAILURE!!! ' + error))
    })

if (jetpack.exists('dist/icons/')) {
    textUI.statusTxt('REMOVE OLD ICONS DIRECTORY')
    jetpack.remove('dist/icons/')
}
