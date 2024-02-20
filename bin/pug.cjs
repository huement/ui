#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unsafe-argument */

//  ░█▀█░█░█░█▀▀░░░█▀▄░█░█░▀█▀░█░░░█▀▄░█▀▀░█▀▄
//  ░█▀▀░█░█░█░█░░░█▀▄░█░█░░█░░█░░░█░█░█▀▀░█▀▄
//  ░▀░░░▀▀▀░▀▀▀░░░▀▀░░▀▀▀░▀▀▀░▀▀▀░▀▀░░▀▀▀░▀░▀
//  Runs the PUG command with a number of custom filters
//  Allowing for JSTransformer & other dynamic data to be applied on build

/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */

const pug = require('pug')
const packData = require('../package.json')
const fs = require('fs-extra')
const c = require('ansi-colors')
const path = require('path')
const async = require('async')
const glob = require('glob')
const jetpack = require('fs-jetpack')
require('dotenv').config()

const pugMojo = {
    pretty: true,
    filters: {
        stylus: function (str, opts) {
            let ret
            str = str.replace(/\\n /g, '')
            const styl = require('stylus')
            styl(str, opts).render(function (err, css) {
                if (err) throw err
                ret = css.replace(/\s/g, '')
            })
            return '\n<style>' + ret + '</style>'
        },
        markdownify: function (block) {
            const jstransformer = require('jstransformer')
            const marked = jstransformer(require('jstransformer-markdown-it'))
            const markdownBlock = marked.render(block).body
            return markdownBlock
        },
        highlightify: function (block, options) {
            const jstransformer = require('jstransformer')
            const highlight = jstransformer(require('jstransformer-highlight'))

            const lang = options.lang || 'html'
            const oc = options.class || ''
            const render = highlight.render(block, { language: lang }).body

            // prettier-ignore
            const results = "<pre class='code " + oc + "' data-lang='" + lang + "'><code>" + render + '</code></pre>'
            return results
        },
        prismify: function (block, options) {
            const jstransformer = require('jstransformer')
            const prism = jstransformer(require('jstransformer-prismjs'))

            const lang = options.lang || 'html'
            const render = prism.render(block, { language: lang }).body

            // prettier-ignore
            const results = "<pre class='code' data-lang='" + lang + "'><code>" + render + '</code></pre>'
            return results
        },
        codeblock: function (block, option) {
            const jstransformer = require('jstransformer')
            const highlight = jstransformer(require('jstransformer-highlight'))

            const lang = option.lang || 'html'
            const cName = option.class || ''
            const prevC = option.previewClass || ''
            const fClass = 'documentation-content' + ' ' + cName

            let escaped = ''
            if (lang === 'html') {
                escaped = `<div class="preview-wrapper"><div class="mojo-preview ${prevC}">${block}</div></div>`
            }

            const highlightBlock = highlight.render(block, {
                language: lang,
            }).body
            const highlighted = `<div class='mojo-highlight'><pre class="code" data-lang="${lang}"><code>${highlightBlock}</code></pre></div>`

            const ex = "<span class='mojo-doclabel'>EXAMPLE</span>"
            const htmlTemplate =
                "<div class='mojo-docblock'>" +
                ex +
                escaped +
                highlighted +
                '</div>'
            const final =
                "<div class='" + fClass + "'>" + htmlTemplate + '</div>'

            return final
        },
        iconify: function (block) {},
    },
}

async function buildMojo(searchDir = 'web/pages/') {
    console.log('')
    console.log(c.white.bold('TRANSFORMING PUG -> HTML...'))

    const pageList = require('../web/pages/webpages.json')

    for (pObj of pageList) {
        pObj.path = searchDir
        console.log('Target: ' + searchDir + pObj.file)
        await buildWebpages(pObj)
    }

    console.log('', '', '')
}

async function buildWebpages(pageData) {
    const html = pug.compileFile(
        pageData.path + pageData.file,
        pugMojo
    )({
        pages: require('../web/pages/webpages'),
        package: packData,
    })

    fs.writeFile('dist' + pageData.url, html, (err) => {
        if (err !== null && err !== undefined) {
            console.error(err)
        }

        // file written successfully
        console.log(
            c.green.bold('dist' + pageData.url),
            c.green(' created successfully!')
        )
    })
}

async function transformPug(pageName, pageOptions) {
    const html = pug.compileFile(
        './web/pages/' + pageName + '.pug',
        pageOptions
    )({
        pages: require('../web/pages/docs/pagelist.json'),
        package: packData,
        envData: { url: process.env.API_URL },
        colorStacks: require('../tokens/stack.json'),
        colorTokens: require('../tokens/chords.json'),
        iconList: require('../web/pages/docs/iconlist.json'),
        templatePages: require('../web/pages/templates/templatelist.json'),
    })

    return html
}

function writeJson(destPath, data, indent) {
    // FS-EXTRA Write JSON to File
    fs.writeJson(destPath, data, (err) => {
        if (err) {
            console.error(err)
            return
        }
        console.log('success!')
    })
    console.log(c.green.bold('JSON FILE'))
}

// With async/await:
async function writeOutFile(f, d) {
    try {
        await fs.outputFile(f, d)
    } catch (err) {
        console.error(err)
    }
}

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, '') // Trim - from end of text
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

/**
 * use regex to find a string for a given file. useful for finding page config data etc
 * @param {String} fullPath - path to file that will be searched
 * @param {String} regexString - string converted into regex filter
 * @return {String|bool} returns either the first instance of found string or false
 */
async function findStringInFile(fullPath, regexString) {
    const data = fs.readFileSync(fullPath).toString('utf8')
    const dataArr = data.split('\n')
    const regex = new RegExp(regexString)
    if (regex.test(data)) {
        for (const line of dataArr) {
            if (regex.test(line)) {
                return line
            }
        }
    }

    return false
}

async function buildDocumentation(searchDir = 'web/pages/docs') {
    // Get a list of all the pages to build
    // Load the required global pug vars
    // Compile each page
    // const baseDir = path.resolve(process.cwd())
    const searchPath = path.resolve(process.cwd(), searchDir)
    const outputDir = 'dist/docs/'

    // console.log(searchPath)

    const AllFiles = jetpack.find(searchPath, {
        matching: '*.pug',
        recursive: false,
    })

    for (const file of AllFiles) {
        console.log('Target: ' + file)
        const pageObj = {}
        const fname = capitalizeFirstLetter(path.parse(file).name)
        const fslug = slugify(fname)
        const furl = './docs/' + fslug + '.html'

        // Grouping
        let fgroup = ''
        const groupName = await findStringInFile(file, /var\sparent\b/)
        if (groupName !== 0 && groupName !== undefined) {
            // Clean Up Match
            fgroup = groupName
                .replace('- var parent =', '')
                .replace('"', '')
                .replace('"', '')
                .replace("'", '')
                .replace("'", '')
                .trim()
        }
        pageObj.group = fgroup
        pageObj.name = fname
        pageObj.url = furl
        pageObj.path = outputDir + fslug + '.html'
        // pageObj.html = ''
        pageObj.html = await transformPug('docs/' + fslug, pugMojo)

        void writeOutFile(pageObj.path, pageObj.html)
        console.log(c.green.bold(fname + ' WRITTEN'))

        // console.log(JSON.stringify(pageObj))
    }

    // Filename is either derived from the target OR explicitly declared
    // let lastItem = this.target.substring(this.target.lastIndexOf("/") + 1);

    // if (this.data.filename) finalPageName = slugify(this.data.filename)

    const totalPages = AllFiles.length
    // if (searchResults.length > 0) {
    //   writeJson(finalPage + '.json', searchResults, options.indent)
    // } else {
    //   writeOutFile(finalPage + '.json', gList, options.indent)
    // }

    console.log(
        '\n',
        c.green.bold(
            `${totalPages} doc pages linked up and saved to: ${outputDir}`
        ),
        '\n'
    )
}

// startUp();
void buildMojo()
// void buildDocumentation()
