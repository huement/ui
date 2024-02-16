#!/usr/bin/env node

//  ██████╗ ██╗   ██╗██████╗ ██╗     ██╗███████╗██╗  ██╗
//  ██╔══██╗██║   ██║██╔══██╗██║     ██║██╔════╝██║  ██║
//  ██████╔╝██║   ██║██████╔╝██║     ██║███████╗███████║
//  ██╔═══╝ ██║   ██║██╔══██╗██║     ██║╚════██║██╔══██║
//  ██║     ╚██████╔╝██████╔╝███████╗██║███████║██║  ██║
//  ╚═╝      ╚═════╝ ╚═════╝ ╚══════╝╚═╝╚══════╝╚═╝  ╚═╝
//   ::: ORACLE CLOUD OBJECT STORAGE FILE UPLOADER :::
//   Uploads package.publish[] to /package.version/*
//   NOTE: Root folder is replaced with the version number.
//         EX: ./dist/mojo.css uploads to /0.0.6/mojo.css

// ---- ??
// Create dist/cdn
// Copy mojo.css to dist/cdn
// Copy /fonts to dist/cdn
// Replace /fonts/ with https://oraclecdn/fonts/
// Upload folder to oracle cloud

const { textUI } = require("./tui.cjs")
const copy = require("recursive-copy")
const jetpack = require("fs-jetpack")
const c = require("ansi-colors")
const fs = require("fs")
const path = require("path")
const { basename, join } = require("path")

const common = require("oci-common")
const os = require("oci-objectstorage")

function getParsedPackage() {
  return JSON.parse(fs.readFileSync("./package.json"))
}

// FILE SYSTEM CONFIG
const packData = getParsedPackage()
const publishData = packData.publish
const uploadDirectory = packData.version
// FILE SYSTEM CONFIG END

// BUCKET DETAILS
const namespaceName = "axxhb5tzni1i"
const bucketName = "huement-cdn-012724"
// BUCKET DETAILS END

// ORACLE CLOUD CONFIG
const uploadOptions = {
  enforceMD5: false,
  maxConcurrentUploads: 0,
  disableBufferingForFiles: true
}
const configurationFilePath = "~/.oci/config"
const provider = new common.ConfigFileAuthenticationDetailsProvider(
  configurationFilePath
)
const client = new os.ObjectStorageClient({
  authenticationDetailsProvider: provider
})
const uploadManager = new os.UploadManager(client, uploadOptions)
uploadManager.shouldUseMultipartUpload = false
// ORACLE CLOUD CONFIG END

const finalListOfFiles = []

// Using the given package.json data it gathers up every file (recursively)
// package.json can give a file or a directory (in which all files are selected)
async function loadFiles() {
  textUI.taskTxt(`${publishData.length} package.json entries to load from`)

  publishData.forEach(function (item, index) {
    if (basename(item) !== ".DS_Store" && fs.existsSync(item)) {
      fs.stat(item, (error, stats) => {
        if (error) {
          return reject(error)
        }
        if (stats.isDirectory()) {
          textUI.statusTxt("Processing Directory: " + basename(item))

          fs.readdir(item, (err, files) => {
            if (err) console.error(`Failed due to ${err}`)

            files.forEach((file) => {
              if (basename(file) !== ".DS_Store") {
                // Pop or Strip first folder from the item's local path
                // Allowing us to replace that with custom upload directory
                const fF = item + path.sep + file
                const dirs = fF.split(path.sep).slice(1).join(path.sep)

                finalListOfFiles.push({
                  name: basename(file),
                  folder: item,
                  path: item + path.sep + file,
                  upload: uploadDirectory + path.sep + dirs
                })
              }
            })
          })
        } else if (stats.isFile()) {
          textUI.statusTxt("Loading File: " + basename(item))

          // Pop or Strip first folder from the item's local path
          // Allowing us to replace that with custom upload directory
          const dirs = item.split(path.sep).slice(1).join(path.sep)
          const parent = item.split(path.sep)
          finalListOfFiles.push({
            name: basename(item),
            folder: parent[0],
            path: item,
            upload: uploadDirectory + path.sep + dirs
          })
        }
      })
    }
  })
}

// Oracle Cloud Functions
const startOracleUpload = async () => {
  textUI.statusTxt("Starting Oracle Cloud upload.")

  // Process in Parallel
  // await Promise.all(
  //   finalListOfFiles.map(async (fileName) => {
  //     console.log(`  [LOAD] ${fileName.name}  [ TO ] ${fileName.upload}`)
  //     oracleUploadFile(fileName.path, fileName.upload)
  //   })
  // )

  // Process in Serial
  // for (const fileName of finalListOfFiles) {
  //   await sleep(1)
  //   await oracleUploadFile(fileName.path, fileName.upload)
  // }

  // Process in Serial via Reduce
  await finalListOfFiles.reduce(async (a, fileName) => {
    // Wait for the previous item to finish processing
    await a
    // Process this item
    await oracleUploadFile(fileName.path, fileName.upload)
  }, Promise.resolve())

  console.timeEnd("Upload Time")
}

const sleep = async (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const oracleUploadFile = async (localName = "", uploadName = "") => {
  try {
    const callback = (res) => {
      console.log("Progress: ", res)
    }
    await uploadManager.upload(
      {
        content: {
          filePath: localName
        },
        requestDetails: {
          namespaceName: namespaceName,
          bucketName: bucketName,
          objectName: uploadName
        }
      },
      callback
    )
  } catch (ex) {
    console.error(`Failed due to ${ex}`)
  }
}

// Core Logic that runs at startup
// This is the logic that allows for the files to be gathered
// and it waits until this is done
const timeAmount = "200" // must be quoted like this
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
    startOracleUpload()
  }
}

const mainLoop = async () => {
  console.time("Upload Time")
  await loadFiles()
  setTimeout(() => {
    processFiles()
  }, timeAmount)
}

textUI.headerLog(
  `Publishing @huement/ui ver: ${packData.version} cn: ${packData.codeName}`
)
mainLoop()
