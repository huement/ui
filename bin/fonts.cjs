#!/usr/bin/env node

/*jshint esversion: 6 */

/**
 * @author: Derek Scott
 * @version: 2021-03-17 04:36:45
 * @file: Converts font files to webfont friendly formats
 */

// Global Variables
const { textUI } = require( "./tui.cjs" );
const cg = require( "../package.json" );
const fs = require( "fs" );
const _ = require( "lodash" );
const path = require( "path" );
const jetpack = require( "fs-jetpack" );
const fontconvert = require( "fontconvert-tool" );

class TokenFonts {
  constructor( fontPath, fontTarget ) {
    this.fontPath = fontPath;
    this.fontTarget = fontTarget;
  }

  assembleFontFiles() {
    // TODO FIX THIS
    const warPig = require( "../tokens/gdb.json" );

    textUI.headerLog( "WEB FONT CONVERSION UNDERWAY!" );

    let fontPath = path.resolve( __dirname, "../../" + warPig.dev.fonts );
    let fontProd = path.resolve( __dirname, "../../" + warPig.prod.fonts );

    let allFontFiles = jetpack.list( fontPath );
    if ( allFontFiles == undefined || allFontFiles.length < 1 ) {
      // @TODO improve this check to actually check the format for otf &/or ttf
      console.log( " " );
      textUI.errorTxt( "  ERROR! No Fonts Found in " + fontPath );
      console.log( " " );
      process.exit( 22 );
    }

    textUI.statusTxt( "Loading fonts in: " + fontPath );
    console.log( " " );

    !fs.existsSync( fontProd ) && fs.mkdirSync( fontProd, { recursive: true } );

    fontconvert.convertFonts( fontPath, fontProd, {
      subset: [
        "Basic Latin",
        "Latin-1 Supplement", // Latin
        "General Punctuation",
        "Currency Symbols", // Punctuation
      ],
    } );
  }
}

module.exports = TokenFonts;
