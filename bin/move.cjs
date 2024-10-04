#!/usr/bin/env node
const fse = require('fs-extra')
const fsp = require('fs/promises')
const fs = require('fs')
const { textUI } = require('./tui.cjs')
const c = require('ansi-colors')
const jetpack = require('fs-jetpack')

// sleep time expects milliseconds
function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time))
}

function getDestSize(target) {
    if (jetpack.exists(target)) {
        var statDest = fs.statSync(target)
        var destSizeInBytes = statDest.size
        return textUI.formatBytes(destSizeInBytes)
    } else {
        return 'ERROR: File not found'
    }
}

function moveSrcDest(srcFile, destFile) {
    textUI.taskTxt('MOVING TO ' + destFile)
    jetpack.move(srcFile, destFile, { overwrite: false })
    var destSize = getDestSize(destFile)
    console.log(destSize)
}

function checkThenMove(sourceFile, outputFile) {
    if (fs.existsSync(outputFile)) {
        textUI.taskTxt('REMOVING OLD FILE...')
        // With Promises:
        fse.remove(outputFile)
            .then(() => {
                moveSrcDest(sourceFile, outputFile)
            })
            .catch((err) => {
                console.error(err)
            })
    } else {
        moveSrcDest(sourceFile, outputFile)
    }
}

function fspCompare(sourceFile, destinationFile) {
    fsp.readFile(destinationFile).then((fileBuffer) => {
        // now read the new file
        fsp.readFile(sourceFile).then((fileBufferNew) => {
            // your logic here
            if (fileBuffer.toString() === fileBufferNew.toString()) {
                textUI.taskTxt('NOT MOVING | EQUAL')
            } else {
                textUI.taskTxt('MOVING | NOT EQUAL')

                checkThenMove(sourceFile, destinationFile)
            }
        })
    })
}

function findAllFilesToUpdate(
    sourceFileToCheck,
    sourceSeachString,
    outputPath
) {
    var allTheFiles = jetpack.find(sourceFileToCheck, {
        matching: sourceSeachString,
    })

    for (const pathPath of allTheFiles) {
        var filename = pathPath.replace(/^.*[\\/]/, '')

        var dest = outputPath + filename

        // console.log( pathPath, dest );
        var statSrc = fs.statSync(pathPath)
        var srcSizeInBytes = statSrc.size
        var srcSize = textUI.formatBytes(srcSizeInBytes)

        var statDest = 0
        var destSizeInBytes = 0
        var destSize = null
        var destSizeCheck = jetpack.exists(dest)
        sleep(1000)

        if (destSizeCheck && destSizeCheck === 'file') {
            statDest = fs.statSync(dest)
            destSizeInBytes = statDest.size
            destSize = textUI.formatBytes(destSizeInBytes)
            sleep(1000)
        }

        // console.log( srcSize, destSize )

        if (!destSize) {
            textUI.taskTxt('File not Found. MOVING AUTOMATICALLY')
            moveSrcDest(pathPath, dest)
        } else {
            fspCompare(pathPath, dest)
            sleep(1000)
            // if ( srcSize === destSize ) {
            //     textUI.taskTxt( "NOT MOVING | EQUAL" )
            // } else {
            //     textUI.taskTxt( "MOVING | NOT EQUAL" )

            //     checkThenMove(pathPath, dest)
            // }
        }
    }
}

findAllFilesToUpdate('_temp', '*.html', 'dist/docs/')

// for ( const pagePath of allDocPages ) {

// }

// process.exit( 0 );

// TARGET FILES
// const src = './pages/index.html'
// const dest = './index.html'

// var statSrc = fs.statSync(src)
// var srcSizeInBytes = statSrc.size
// var srcSize = textUI.formatBytes(srcSizeInBytes)

// var statDest = 0
// var destSizeInBytes = 0
// var destSize = null
// var destSizeCheck = jetpack.exists(dest)
// sleep(100)
// // console.log( destSizeCheck )
// if (destSizeCheck === 'file') {
//     statDest = fs.statSync(dest)
//     destSizeInBytes = statDest.size
//     destSize = textUI.formatBytes(destSizeInBytes)
//     sleep(100)
// }

// // console.log( srcSize, destSize )

// if (!destSize) {
//     textUI.taskTxt('NO INDEX. MOVING AUTOMATICALLY')
//     moveSrcDest()
//     process.exit()
// } else {
//     // tmpBuf.toString() === testBuf.toString();
//     // first read the existinng file
//     fsp.readFile(dest).then((fileBuffer) => {
//         // now read the new file
//         fsp.readFile(src).then((fileBufferNew) => {
//             // your logic here
//             if (fileBuffer.toString() === fileBufferNew.toString()) {
//                 textUI.taskTxt('NOT MOVING | EQUAL')
//             } else {
//                 textUI.taskTxt('MOVING | NOT EQUAL')

//                 if (fs.existsSync(dest)) {
//                     textUI.taskTxt('REMOVING OLD FILE...')
//                     // With Promises:
//                     fse.remove(dest)
//                         .then(() => {
//                             moveSrcDest()
//                         })
//                         .catch((err) => {
//                             console.error(err)
//                         })
//                 } else {
//                     moveSrcDest()
//                 }
//             }
//         })
//     })
// }
