#!/usr/bin/env node
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */

const pug = require('pug')
const packData = require('../package.json')
const fs = require('fs')
const c = require('ansi-colors')

const options = {
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

      const highlightBlock = highlight.render(block, { language: lang }).body
      const highlighted = `<div class='mojo-highlight'><pre class="code" data-lang="${lang}"><code>${highlightBlock}</code></pre></div>`

      const ex = "<span class='mojo-doclabel'>EXAMPLE</span>"
      const htmlTemplate = "<div class='mojo-docblock'>" + ex + escaped + highlighted + '</div>'
      const final = "<div class='" + fClass + "'>" + htmlTemplate + '</div>'

      return final
    },
    iconify: function (block) {
    }
  }
}

async function buildMojo () {
  console.log('')
  console.log(c.white.bold('TRANSFORMING PUG -> HTML...'))
  await buildWebpages('index')
  await buildWebpages('mojo')
  await buildWebpages('grid')
  console.log('', '', '')
}

async function buildWebpages (pageName) {
  const html = pug.compileFile('./web/pages/' + pageName + '.pug', options)({
    pages: require('../web/pages/webpages'),
    package: packData
  })

  fs.writeFile('dist/' + pageName + '.html', html, err => {
    if (err !== null && err !== undefined) {
      console.error(err)
    }

    // file written successfully
    console.log(c.green.bold('dist/' + pageName + '.html'), c.green(' created successfully!'))
  })
}

// startUp();
void buildMojo()
