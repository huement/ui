#!/usr/bin/env node
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */

const copy = require('recursive-copy')
const c = require('ansi-colors')

const options = {
    overwrite: true,
    expand: true,
    dot: true,
    junk: false,
}

copy('public', 'dist', options)
    .then(function (results) {
        console.log(
            '\n',
            c.green.bold('COPIED ' + results.length + ' FILES'),
            '\n'
        )
    })
    .catch(function (error) {
        console.error(c.red.bold('COPY FAILURE!!! ' + error))
    })
