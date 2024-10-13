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

copy('web/public', 'docs', options)
    .then(function (results) {
        console.log('\n')
        textUI.taskTxt('COPIED ' + results.length + ' FILES')
        console.log('\n')

    })
    .catch(function (error) {
        textUI.errorTxt(c.red.bold('COPY FAILURE!!! ' + error))
    })
