//   DIGITAL OCEAN SPACES | S3 OBJECT STORAGE UPLOADER
//
//   Uploads package.publish[] to /package.version/*/
//   EX: ./dist/mojo.css => /0.5.6/mojo.css

const AWS = require('aws-sdk')
const fs = require('fs')
const { textUI } = require('./tui.cjs')
const path = require('path')
const { basename, join } = require('path')
const mime = require('mime-types')

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

// FILE SYSTEM CONFIG
function getParsedPackage() {
    return JSON.parse(fs.readFileSync('./package.json'))
}

require('dotenv').config() // populates process.env from .env file

process.on('exit', function (code) {
    return console.log(`Exiting with code: ${code}`)
})

class S3FileManager {
    finalListOfFiles = new Array()

    constructor() {
        if (!argv.build) {
            textUI.headerLog('Initializing S3 File Manager Sync')
        }
        this.finalListOfFiles = new Array()
        this.packData = getParsedPackage()
        this.publishData = this.packData.publish
        this.uploadDirectory = this.packData.version
        this.s3BucketName =
            process.env.AWS_BUCKETNAME || this.packData.s3BucketName
        this.awsEndpoint = process.env.AWS_ENDPOINT || this.packData.awsEndpoint
        this.timeAmount = '200' // must be quoted like this
        this.maxCount = 5
        this.currentCount = 0

        //VERIFY
        if (!this.s3BucketName || this.s3BucketName.length < 2) {
            textUI.errorTxt(
                'D.O. SPACES ERROR | AWS_BUCKETNAME was not found in .env & s3BucketName wasnt in package.json'
            )
            process.exit(10)
        }

        if (!this.awsEndpoint || this.awsEndpoint.length < 10) {
            textUI.errorTxt(
                'D.O. SPACES ERROR | AWS_ENDPOINT was not found in .env file & awsEndpoint wasnt in package.json'
            )
            process.exit(20)
        }

        // Everything is Good to Go with requirements
        // Make the DigitalOcean Objects w/ the given (validated) params

        this.spacesEndpoint = new AWS.Endpoint(this.awsEndpoint)
        this.s3 = new AWS.S3({ endpoint: this.spacesEndpoint })
    }

    // Using the given package.json data it gathers up every file (recursively)
    // package.json can give a file or a directory (in which all files are selected)
    async loadFiles() {
        textUI.taskTxt(
            `${this.publishData.length} package.json entries to load from`
        )

        this.publishData.forEach(function (item, index) {
            if (basename(item) !== '.DS_Store' && fs.existsSync(item)) {
                fs.stat(item, (error, stats) => {
                    if (error) {
                        return reject(error)
                    }
                    if (stats.isDirectory()) {
                        textUI.statusTxt(
                            'Processing Directory: ' + basename(item)
                        )

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

                                    this.finalListOfFiles.push({
                                        name: basename(file),
                                        folder: item,
                                        path: item + path.sep + file,
                                        upload:
                                            this.uploadDirectory +
                                            path.sep +
                                            dirs,
                                        mime: mime_type,
                                    })
                                }
                            })
                        })
                    } else if (stats.isFile()) {
                        textUI.statusTxt('Loading File: ' + basename(item))

                        // Pop or Strip first folder from the item's local path
                        // Allowing us to replace that with custom upload directory
                        const dirs = item
                            .split(path.sep)
                            .slice(1)
                            .join(path.sep)
                        const parent = item.split(path.sep)
                        const mime_type = mime.lookup(item)

                        this.finalListOfFiles.push({
                            name: basename(item),
                            folder: parent[0],
                            path: item,
                            upload: this.uploadDirectory + path.sep + dirs,
                            mime: mime_type,
                        })
                    }
                })
            }
        })
    }

    // Main Upload Function
    // Simply pass it the file path of what is to be uploaded
    async uploadFile(fileName, uploadPath, mimeType) {
        const fileContent = fs.readFileSync(fileName)
        const params = {
            Bucket: this.s3BucketName,
            Key: uploadPath,
            Body: fileContent,
            ACL: 'public-read',
            ContentType: mimeType,
            ContentEncoding: 'base64',
        }

        this.s3.upload(params, (err, data) => {
            if (err) {
                console.error('Error uploading file:', err)
            } else {
                textUI.taskTxt(`Successful Upload [URL] ${data.Location}`)
            }
        })
    }

    async startS3Upload() {
        textUI.statusTxt('Starting Digital Ocean S3 Upload!')
        await this.finalListOfFiles.reduce(async (a, fileName) => {
            await a
            await this.uploadFile(fileName.path, fileName.upload, fileName.mime)
        }, Promise.resolve())

        console.timeEnd('Upload Time')
    }

    // Core Logic that runs at startup
    // Gather up all the files that are going to uploaded
    // and it waits until this is done before calling the uploader
    async processFiles() {
        if (
            this.finalListOfFiles.length < 0 &&
            this.currentCount <= this.maxCount
        ) {
            setTimeout(() => {
                this.processFiles()
            }, timeAmount)
            this.currentCount++
            return false
        }

        if (this.finalListOfFiles.length > 0) {
            textUI.taskTxt(
                `${this.finalListOfFiles.length} Files Ready to Upload!`
            )
            this.startS3Upload()
        }
    }

    async mainLoop() {
        await this.loadFiles()
        setTimeout(() => {
            this.processFiles()
        }, this.timeAmount)
    }
}

module.exports = S3FileManager

if (argv.build) {
    textUI.headerLog('RUNNING S3 FILE SYNC COMMAND...')
    const s3Manager = new S3FileManager()
    s3Manager.mainLoop()
}
