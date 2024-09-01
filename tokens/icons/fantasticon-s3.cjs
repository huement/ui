// FILE SYSTEM CONFIG
require('dotenv').config()
// console.log(process.env)
var pjson = require('../../package.json')

module.exports = {
    name: 'icons-s3',
    inputDir: 'tokens/icons/theme',
    outputDir: 'dist/hi',
    fontTypes: ['ttf', 'woff', 'woff2'],
    assetTypes: ['css', 'json', 'html'],
    fontsUrl: process.env.AWS_URL + '/' + pjson.version + '/fonts/icons',
    formatOptions: {
        json: {
            indent: 2,
        },
    },
    prefix: 'hui',
    normalize: true,
    templates: {
        css: 'tokens/icons/icon-tp.css.hbs',
    },
}
