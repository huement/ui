/**
 * grunt-google-cdnify
 * https://github.com/johnny13/grunt-page-data
 *
 * Copyright (c) 2022 Huement.com
 * Licensed under the MIT license.
 *
 * This is a really cool complex async multiTask that will assemble JSON files
 * from a given folder. Basically any directory + files represented as an object.
 *
 * Its mainly used in mojo to create links to each file via Pug templates.
 *
 * Its an Async task, so its a bit different than most Grunt tasks, because it
 * can read the files its gathering up, taking data from the header of each file
 * allowing the files to declare their own icons and groupings etc.
 *
 */

module.exports = function (grunt, gopts) {
  var fs = require("fs");
  var path = require("path");
  var async = require("async");
  var glob = require("glob");
  var jetpack = require("fs-jetpack");

  grunt.registerMultiTask(
    "json-list",
    "Assemble JSON object from directory of files",
    async function (target) {
      // Super Important! Pay Attention Fuck Face. This is an Async Task.
      // If you want it to be a real multi task, you must call this function
      // when the tasks completes, otherwise it will end the chain after 1 run.
      var done = this.async();

      // grunt.log.writeln(this.target);
      // grunt.log.writeln(JSON.stringify(this.data));

      var options = this.options({
        indent: 2,
      });

      var self = this;

      options.filename = self.target;

      var baseDir = path.resolve(process.cwd());

      if (!options.savePath && !self.data.savePath) {
        grunt.log.error(
          'Option and/or Task "savePath" not provided! Cannot continue.'
        );
        grunt.fail.fatal(JSON.stringify(options));
      }

      if (!self.data.searchPath) {
        grunt.log.error('Task "searchPath" not provided! Cannot continue.');
        grunt.fail.fatal(JSON.stringify(self.data));
      }

      let searchFor = "*.pug";
      if (self.data.searchFor) {
        searchFor = self.data.searchFor;
      } else if (options.searchFor) {
        searchFor = options.searchFor;
      }

      if (self.data.savePath) {
        options.savePath = self.data.savePath;
      }

      if (self.data.filename) {
        options.filename = self.data.filename;
      }

      if (grunt.option("verbose")) {
        grunt.log.writeln("\nJSON-LIST Task\n");
        //grunt.log.writeln(JSON.stringify(gopts));
        grunt.log.writeln("Output Target: " + options.savePath);
        grunt.log.writeln("Task Data: " + JSON.stringify(self.data));
        grunt.log.writeln("Base Dir: " + baseDir);
        grunt.log.writeln("All Data: " + JSON.stringify(self));
        grunt.log.writeln("\n");
      }

      /**
       * Writes JSON data to a file.
       * @param {String} destPath - A filepath for where to save the file.
       * @param {Object|Array} data - Value to covert to JSON and saved to file.
       * @param {Number} [indent=2] - The no. of spaces to indent the JSON.
       */
      function writeJson(destPath, data, indent) {
        indent = typeof indent !== "undefined" ? indent : 2;
        grunt.file.write(destPath, JSON.stringify(data, null, indent));
        grunt.log.writeln("Saved \x1b[96m1\x1b[0m file");
      }

      /**
       * Checks whether a file exists and logs any missing files to console.
       * @param {String} filePath - The filepath to check for its existence.
       * @returns {Boolean} - true if the filepath exists, otherwise false.
       */
      function fileExists(filePath) {
        if (!grunt.file.exists(filePath)) {
          grunt.fail.warn('Unable to read "' + filePath + '"');
          return false;
        }
        return true;
      }

      /**
       * Transform a string into a web friendly URL slug
       * @param {String} text - The string that should be turned into a slug
       */
      function slugify(text) {
        return text
          .toString()
          .toLowerCase()
          .replace(/\s+/g, "-") // Replace spaces with -
          .replace(/[^\w\-]+/g, "") // Remove all non-word chars
          .replace(/\-\-+/g, "-") // Replace multiple - with single -
          .replace(/^-+/, "") // Trim - from start of text
          .replace(/-+$/, ""); // Trim - from end of text
      }

      let searchResults = [];
      let searchPath = path.resolve(process.cwd(), self.data.searchPath);

      if (fileExists(searchPath)) {
        let AllFiles = jetpack.find(searchPath, {
          matching: searchFor,
          recursive: false,
        });

        for (const file of AllFiles) {
          let fname = path.parse(file).name;
          let fslug = slugify(fname);
          let furl = self.data.searchPath.replace(/\/$/, "") + "/" + fslug;

          let pageObj = { name: fname, url: furl };
          searchResults.push(pageObj);
        }

        // Filename is either derived from the target OR explicitly declared
        //let lastItem = self.target.substring(self.target.lastIndexOf("/") + 1);
        let finalPageName = slugify(options.filename);

        let totalPages = AllFiles.length;

        let finalPage = path.resolve(
          process.cwd(),
          options.savePath,
          finalPageName
        );

        writeJson(finalPage + ".json", searchResults, options.indent);

        grunt.log.writeln("");
        grunt.log.ok(
          `${totalPages} pages linked up and saved to: ${finalPage}.json`
        );
        grunt.log.writeln("");
        done();
      } else {
        grunt.log.error(searchPath + " is not a valid path.");
        grunt.fail.fatal(JSON.stringify(self.data));
        done(false);
      }
    }
  );
};
