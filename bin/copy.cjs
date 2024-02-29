#!/usr/bin/env node
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const { textUI } = require('./tui.cjs')
const copy = require('recursive-copy')
const c = require('ansi-colors')
const jetpack = require('fs-jetpack')

const options = {
    overwrite: true,
    expand: true,
    dot: true,
    junk: false,
}

copy('public', 'dist', options)
    .then(function (results) {
        console.log('\n')
        textUI.taskTxt('COPIED ' + results.length + ' FILES')
        console.log('\n')
    })
    .catch(function (error) {
        textUI.errorTxt(c.red.bold('COPY FAILURE!!! ' + error))
    })

if (jetpack.exists('dist/icons/')) {
    textUI.statusTxt('REMOVE OLD ICONS DIRECTORY')
    jetpack.remove('dist/icons/')
}
