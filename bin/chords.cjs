#!/usr/bin/env node

/*jshint esversion: 6 */

/**
 * @author: Derek Scott
 * @version: 2021-03-17 04:36:45
 * @file: Creates ModularScale, Vertical Rhythm, Breakpoint "Design Token Chords"
 */
const { textUI } = require('./tui.cjs')
const { fileMGMT } = require('./filemgmt.cjs')
const cg = require('../package.json')
const _ = require('lodash')
const path = require('path')
const colormap = require('colormap')
const json2scss = require('json2scss')
const ModularScale = require('modular-scale')
const jetpack = require('fs-jetpack')
const { TypeScale } = require('@ntdalbec/type-scale')
// const ColorScale = require('color-scale')
const {
    getBoxHeight,
    getLineMargin,
    getLineHeight,
    getBoxMargin,
} = require('rhythm-fns')

class TokenChords {
    constructor(designTokenFile) {
        // Load Variables
        this.dataFile = require(designTokenFile)

        this.chordFileSCSS = path.resolve(
            __dirname,
            '../' + this.dataFile.harmonySCSSFile
        )

        this.chordFileJSON = path.resolve(
            __dirname,
            '../' + this.dataFile.harmonyJSONFile
        )

        this.params = require(this.dataFile.chordTokens)
        // console.log(this.params)

        // process.exit(1)

        this.harmonyObj = false
        this.harmonyJSON = { chords: {} }
    }

    // MAIN HARMONY MAP
    assembleTypeJSON() {
        // ModularScale VerticalRhythm BreakPoint
        textUI.statusTxt(
            '[JSON] Building Modular Scale & Vertical Rhythm object data'
        )

        var sassTokens = {}
        var localHarmonyJSON = {}

        var colors = colormap({
            colormap: 'jet',
            nshades: 14,
            format: 'hex',
            alpha: 1,
        })

        var iS = 0
        _.forEach(this.params.chords, function (value, i) {
            // console.log(value)
            let bp = value.break
            let ts = value.text
            let lh = value.line

            let ms = ModularScale({
                ratio: value.scale,
                base: ts + 'px',
            })

            // console.log(`${bp} ${ts}`)

            // let scale = new TypeScale({ scale: value.scale })
            // console.log(scale)

            let htags_px = {
                h1: ms(5).toFixed(2) + 'px',
                h2: ms(4).toFixed(2) + 'px',
                h3: ms(3).toFixed(2) + 'px',
                h4: ms(2).toFixed(2) + 'px',
                h5: ms(1).toFixed(2) + 'px',
                h6: ms(0).toFixed(2) + 'px',
            }

            let htags_rem = {
                h1: ms(5, true).toFixed(2) + 'rem',
                h2: ms(4, true).toFixed(2) + 'rem',
                h3: ms(3, true).toFixed(2) + 'rem',
                h4: ms(2, true).toFixed(2) + 'rem',
                h5: ms(1, true).toFixed(2) + 'rem',
                h6: ms(0, true).toFixed(2) + 'rem',
            }

            // prettier-ignore
            let htags_lineHeights = {
              h1: getLineHeight(ms(5), value.line, value.scale).toFixed(2),
              h2: getLineHeight(ms(4), value.line, value.scale).toFixed(2),
              h3: getLineHeight(ms(3), value.line, value.scale).toFixed(2),
              h4: getLineHeight(ms(2), value.line, value.scale).toFixed(2),
              h5: getLineHeight(ms(1), value.line, value.scale).toFixed(2),
              h6: getLineHeight(ms(0), value.line, value.scale).toFixed(2),
            };

            let htags_lineHeights_px = {
                h1:
                    getLineHeight(ms(5), value.line, value.scale).toFixed(2) +
                    'px',
                h2:
                    getLineHeight(ms(4), value.line, value.scale).toFixed(2) +
                    'px',
                h3:
                    getLineHeight(ms(3), value.line, value.scale).toFixed(2) +
                    'px',
                h4:
                    getLineHeight(ms(2), value.line, value.scale).toFixed(2) +
                    'px',
                h5:
                    getLineHeight(ms(1), value.line, value.scale).toFixed(2) +
                    'px',
                h6:
                    getLineHeight(ms(0), value.line, value.scale).toFixed(2) +
                    'px',
            }

            let htags_lineHeights_rem = {
                h1: (htags_lineHeights.h1 / value.text).toFixed(2) + 'rem',
                h2: (htags_lineHeights.h2 / value.text).toFixed(2) + 'rem',
                h3: (htags_lineHeights.h3 / value.text).toFixed(2) + 'rem',
                h4: (htags_lineHeights.h4 / value.text).toFixed(2) + 'rem',
                h5: (htags_lineHeights.h5 / value.text).toFixed(2) + 'rem',
                h6: (htags_lineHeights.h6 / value.text).toFixed(2) + 'rem',
            }

            let lhpx = (lh * ts).toFixed(2)
            let lhrem = lhpx / value.text

            // Assemble the big-ass giant SASSY sumbitch of an object
            let widthPX = 0
            let widthREM = 0
            let maxPX = 0
            let maxREM = 0
            if (bp > 0) {
                widthPX = bp + 'px'
                widthREM = (bp / ts).toFixed(2) + 'rem'
                maxPX = value.max + 'px'
                maxREM = (value.max / ts).toFixed(2) + 'rem'
            } else {
                // Special Zero Starting Case
            }

            let typeObj = {
                name: textUI.quoteString(value.name),
                abrev: textUI.quoteString(value.abr),
                width: widthPX,
                width_rem: widthREM,
                max: maxPX,
                max_rem: maxREM,
                fontSize: ts + 'px',
                lineHeight: lh,
                lineHeight_px: lhpx + 'px',
                lineHeight_rem: lhrem + 'rem',
                vertical: value.vertical,
                scale: value.scale,
                scale_name: textUI.quoteString(value.scale_name),
                headings: htags_rem,
                headings_px: htags_px,
                headingsLine: htags_lineHeights_rem,
                headingsLine_px: htags_lineHeights_px,
                color: colors[i + iS],
            }

            // Slightly Tweaked version for JSON. Just go with it.
            let modTypeObj = typeObj
            modTypeObj.name = value.name
            modTypeObj.abrev = value.abr
            modTypeObj.scale_name = value.scale_name

            iS++
            sassTokens[value.abr] = typeObj
            localHarmonyJSON[value.abr] = modTypeObj
        })

        this.harmonyJSON.chords = localHarmonyJSON
        this.tackOnJSONData()
        return sassTokens
    }

    // GRID BREAKPOINT MAP
    assembleGBJSON() {
        let mqTokens = { 'grid-breakpoints': {} }

        _.forEach(this.params, function (value, i) {
            //console.log(value.break);
            let total = value.break
            if (value.break > 0) total = value.break + 'px'
            mqTokens['grid-breakpoints'][value.abr] = total
        })

        return mqTokens
    }

    // CONTAINER MAX WIDTH MAP
    assembleCMWJSON() {
        let mqTokens = { 'container-max-widths': {} }

        _.forEach(this.params, function (value, i) {
            if (value.abr !== 'xs') {
                let total = value.max
                if (value.break > 0) total = value.max + 'px'
                mqTokens['container-max-widths'][value.abr] = total
            }
        })

        return mqTokens
    }

    tackOnJSONData() {
        textUI.statusTxt('[JSON] Adding Default Config Tokens')

        this.harmonyJSON = Object.assign({}, this.harmonyJSON, {
            superclass: this.dataFile.superclass,
            'mq-responsive': this.dataFile.mqResponsive,
            'base-font-size': this.dataFile.baseFontSize,
            'base-line-height': this.dataFile.baseLineHeight,
            version: cg.version,
            date: cg.built,
            'code-name': cg.codename,
        })
    }

    tackOnConfigData() {
        textUI.statusTxt('[SASS] Adding Default Config Tokens')

        jetpack.append(this.chordFileSCSS, '\r\n')
        jetpack.append(this.chordFileSCSS, '/// Default Mojo Config')
        jetpack.append(this.chordFileSCSS, '\r\n')

        // default config values
        let localCFS = this.chordFileSCSS
        let tokenVars = [
            textUI.scssVar('superclass', this.dataFile.superclass, true),
            textUI.scssVar('mq-responsive', this.dataFile.mqResponsive),
            textUI.scssVar('base-font-size', this.dataFile.baseFontSize),
            textUI.scssVar('base-line-height', this.dataFile.baseLineHeight),
            textUI.scssVar('version', cg.version, true),
            textUI.scssVar('date', cg.built, true),
            textUI.scssVar('code-name', cg.codename, true),
        ]
        _.forEach(tokenVars, function (value) {
            jetpack.append(localCFS, value)
            jetpack.append(localCFS, '\r\n')
        })
    }

    // PLACE DATA INTO FILES
    jetpackFiles(tpData, gbData, cmwData) {
        // Create our JSON for the JSON File &  Fill JSON file
        jetpack.write(this.chordFileJSON, JSON.stringify(this.harmonyJSON))

        console.log(' ')
        textUI.taskTxt('Harmony JSON: ' + this.chordFileJSON + ' `created!')

        // Assemble SCSS Data
        let tsLines = [tpData, gbData, cmwData]

        // Write SCSS Data to File
        let chordFile = this.chordFileSCSS
        _.forEach(tsLines, function (value) {
            jetpack.append(chordFile, '\r\n')
            jetpack.append(chordFile, value)
        })

        jetpack.append(chordFile, '\r\n')

        textUI.taskTxt('Harmony SCSS: ' + chordFile + ' created!')
    }

    // LOAD TOKENS AND CREATE FILES BASED ON THAT DATA
    assmebleChordTokens() {
        textUI.headerLog('Assembling Design Token Chords')

        textUI.taskTxt('Creating Empty JSON+SCSS Files...')
        // Create blank SCSS File
        fileMGMT.templateNewFile(
            this.chordFileSCSS,
            '@huement/ui automatically generated SCSS design tokens file'
        )
        // Create blank JSON File
        fileMGMT.blankNewFile(this.chordFileJSON)

        // Get the Data to fill these files ready
        let tobj = this.assembleTypeJSON()
        let sassTokens = { chords: tobj }
        let typeSassData = json2scss(sassTokens)
        this.harmonyObj = tobj
        textUI.statusTxt(
            '[SASS] Responsive-Rhythmic-Typography Object Created!'
        )

        let gbJSON = this.assembleGBJSON()
        let gbsassData = json2scss(gbJSON)
        textUI.statusTxt('[SASS] Grid-Breakpoints Object Created')

        let cmwJSON = this.assembleCMWJSON()
        let cmwsassData = json2scss(cmwJSON)
        textUI.statusTxt('[SASS] Container Max Widths Object Created')

        // send data to be added to files
        this.jetpackFiles(typeSassData, gbsassData, cmwsassData)

        // add config data
        this.tackOnConfigData()

        console.log(' ')
        console.log(' ')
        textUI.taskTxt('DONE! Design Token Harmony Task Finished!')
        console.log(' ')
    }
}

module.exports = TokenChords
