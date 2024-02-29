#!/usr/bin/env node
'use strict'
const { textUI } = require('./tui.cjs')
const fs = require('fs')
const browserify = require('browserify')
const path = require('path')

// FILE SYSTEM CONFIG
const packageData = textUI.getParsedPackage()
textUI.statusTxt(`creating ${packageData.name} javascript bundle...`)

browserify('./src/js/index.umd.js')
    .transform('babelify', {
        presets: ['@babel/preset-env'],
    })
    .bundle()
    .pipe(fs.createWriteStream('./dist/js/bundle.js'))
