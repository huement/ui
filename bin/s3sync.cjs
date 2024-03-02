#!/usr/bin/env node

//  ░░░░░░░░░░░░░█▀▀░▀▀█░░░█▀▀░█░█░█▀█░█▀▀░░░░░░░░░░░░░
//  ░░░░░░░░░░░░░▀▀█░░▀▄░░░▀▀█░░█░░█░█░█░░░░░░░░░░░░░░░
//  ░░░░░░░░░░░░░▀▀▀░▀▀░░░░▀▀▀░░▀░░▀░▀░▀▀▀░░░░░░░░░░░░░
//  DIGITAL OCEAN SPACES     S3 OBJECT STORAGE UPLOADER

//   Uploads package.publish[] to /package.version/*
//   NOTE: Root folder is replaced with the version number.
//         EX: ./dist/mojo.css uploads to /0.0.6/mojo.css

const AWS = require('aws-sdk')
const fs = require('fs')
const { textUI } = require('./tui.cjs')
const path = require('path')
const { basename, join } = require('path')
const mime = require('mime-types')
// const fs = require('fs').promises

// FILE SYSTEM CONFIG
function getParsedPackage() {
    return JSON.parse(fs.readFileSync('./package.json'))
}

require('dotenv').config() // populates process.env from .env file
const packData = getParsedPackage() // load package.json as an object
const publishData = packData.publish
const uploadDirectory = packData.version
const s3BucketName = process.env.AWS_BUCKETNAME || packData.s3BucketName

//VERIFY
if (s3BucketName == undefined || s3BucketName.length < 2) {
    textUI.errorTxt(
        'AWS_BUCKETNAME was not found in .env & s3BucketName wasnt in  package.json'
    )
}

if (!process.env.AWS_ENDPOINT && !packData.awsEndpoint) {
    textUI.errorTxt(
        'AWS_ENDPOINT was not found in .env file & awsEndpoint wasnt in package.json'
    )
}
// FILE SYSTEM CONFIG END

const finalListOfFiles = []

// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new AWS.Endpoint(
    process.env.AWS_ENDPOINT || packData.awsEndpoint
)
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
})

// Using the given package.json data it gathers up every file (recursively)
// package.json can give a file or a directory (in which all files are selected)
async function loadFiles() {
    textUI.taskTxt(`${publishData.length} package.json entries to load from`)

    publishData.forEach(function (item, index) {
        if (basename(item) !== '.DS_Store' && fs.existsSync(item)) {
            fs.stat(item, (error, stats) => {
                if (error) {
                    return reject(error)
                }
                if (stats.isDirectory()) {
                    textUI.statusTxt('Processing Directory: ' + basename(item))

                    fs.readdir(item, (err, files) => {
                        if (err) console.error(`Failed due to ${err}`)

                        files.forEach((file) => {
                            if (basename(file) !== '.DS_Store') {
                                // Pop or Strip first folder from the item's local path
                                // Allowing us to replace that with custom upload directory
                                const fF = item + path.sep + file
                                const dirs = fF
                                    .split(path.sep)
                                    .slice(1)
                                    .join(path.sep)
                                const mime_type = mime.lookup(file)

                                finalListOfFiles.push({
                                    name: basename(file),
                                    folder: item,
                                    path: item + path.sep + file,
                                    upload: uploadDirectory + path.sep + dirs,
                                    mime: mime_type,
                                })
                            }
                        })
                    })
                } else if (stats.isFile()) {
                    textUI.statusTxt('Loading File: ' + basename(item))

                    // Pop or Strip first folder from the item's local path
                    // Allowing us to replace that with custom upload directory
                    const dirs = item.split(path.sep).slice(1).join(path.sep)
                    const parent = item.split(path.sep)
                    const mime_type = mime.lookup(item)

                    finalListOfFiles.push({
                        name: basename(item),
                        folder: parent[0],
                        path: item,
                        upload: uploadDirectory + path.sep + dirs,
                        mime: mime_type,
                    })
                }
            })
        }
    })
}

// Main Upload Function
// Simply pass it the file path of what is to be uploaded
const uploadFile = async (fileName, uploadPath, mimeType) => {
    // textUI.taskTxt(`${fileName} [TO] ${uploadPath} [AS] ${mimeType}`)

    const fileContent = fs.readFileSync(fileName)
    // const fileContent = await fs.readFile('./README.md', 'binary')

    const params = {
        Bucket: s3BucketName,
        Key: uploadPath,
        Body: fileContent,
        ACL: 'public-read',
        ContentType: mimeType,
        ContentEncoding: 'base64',
    }

    s3.upload(params, (err, data) => {
        if (err) {
            console.error('Error uploading file:', err)
        } else {
            textUI.taskTxt(`Successful Upload [URL] ${data.Location}`)
        }
    })
}

const startS3Upload = async () => {
    textUI.statusTxt('Starting S3 Upload!')
    // Process in Serial via Reduce
    await finalListOfFiles.reduce(async (a, fileName) => {
        // Wait for the previous item to finish processing
        await a
        // Process this item
        await uploadFile(fileName.path, fileName.upload, fileName.mime)

        // await sleep(2)
    }, Promise.resolve())

    console.timeEnd('Upload Time')
}

// Core Logic that runs at startup
// This is the logic that allows for the files to be gathered
// and it waits until this is done
const timeAmount = '200' // must be quoted like this
const maxCount = 5
let currentCount = 0
const processFiles = async () => {
    if (finalListOfFiles.length < 0 && currentCount <= maxCount) {
        setTimeout(() => {
            processFiles()
        }, timeAmount)
        currentCount++
        return false
    }

    if (finalListOfFiles.length > 0) {
        textUI.taskTxt(`${finalListOfFiles.length} Files Ready to Upload!`)
        //console.log(JSON.stringify(finalListOfFiles, "", 2))
        startS3Upload()
    }
}

const mainLoop = async () => {
    console.time('Upload Time')
    await loadFiles()
    setTimeout(() => {
        processFiles()
    }, timeAmount)
}

textUI.headerLog(
    `Publishing @huement/ui ver: ${packData.version} cn: ${packData.codeName}`
)
mainLoop()
