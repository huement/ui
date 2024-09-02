#!/usr/bin/env node
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const fse = require( 'fs-extra' )
const fsp = require( 'fs/promises' )
const fs = require( 'fs' )
const { textUI } = require( './tui.cjs' )
const c = require( 'ansi-colors' )
const jetpack = require( 'fs-jetpack' )

// sleep time expects milliseconds
function sleep( time ) {
    return new Promise( ( resolve ) => setTimeout( resolve, time ) );
}

// TARGET FILES
const src = './pages/index.html'
const dest = './index.html'

var statSrc = fs.statSync( src )
var srcSizeInBytes = statSrc.size
var srcSize = textUI.formatBytes( srcSizeInBytes )

var statDest = 0
var destSizeInBytes = 0
var destSize = null
var destSizeCheck = jetpack.exists( dest )
sleep( 100 )
console.log( destSizeCheck )
if ( destSizeCheck === 'file' ) {
    statDest = fs.statSync( dest )
    destSizeInBytes = statDest.size
    destSize = textUI.formatBytes( destSizeInBytes )
    console.log( 'setting dest size ' + destSize )
    sleep( 100 )
}


function getDestSize() {
    if ( jetpack.exists( dest ) ) {
        statDest = fs.statSync( dest )
        destSizeInBytes = statDest.size
        destSize = textUI.formatBytes( destSizeInBytes )
    }
}

function moveSrcDest() {
    textUI.taskTxt( "MOVING TO " + dest )
    jetpack.move( src, dest, { overwrite: false } )
    getDestSize()
    console.log( destSize )
    // fse.move( src, dest, err => {
    //     if ( err ) return console.error( err )
    //     textUI.errorTxt( 'The file has been moved' );
    //     getDestSize()
    //     console.log( destSize )
    // } )
}

console.log( srcSize, destSize )

if ( !destSize ) {
    textUI.taskTxt( "NO INDEX. MOVING AUTOMATICALLY" )
    moveSrcDest()
    process.exit()
} else {
    // tmpBuf.toString() === testBuf.toString();
    // first read the existinng file
    fsp.readFile( dest ).then( fileBuffer => {
        // now read the new file
        fsp.readFile( src ).then( fileBufferNew => {
            // your logic here
            if ( fileBuffer.toString() === fileBufferNew.toString() ) {
                textUI.taskTxt( "NOT MOVING | EQUAL" )
            } else {
                textUI.taskTxt( "MOVING | NOT EQUAL" )

                if ( fs.existsSync( dest ) ) {
                    textUI.taskTxt( "REMOVING OLD FILE..." )
                    // With Promises:
                    fse.remove( dest )
                        .then( () => {
                            moveSrcDest()
                        } )
                        .catch( err => {
                            console.error( err )
                        } )
                } else {
                    moveSrcDest()
                }
            }
        } )
    } )
}
