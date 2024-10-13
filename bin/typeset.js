/**
 *   @brief   Grunt wrapper for Typeset
 *   @details Typeset is an HTML pre-proces­sor for web ty­pog­ra­phy.
              It uses no client-side JavaScript and gives you hang­ing punc­tu­a­tion,
              soft hy­phen in­ser­tion, op­ti­cal mar­gin out­dents, small-caps
              con­ver­sion and punctuation substitution.
 *   @link    https://www.npmjs.com/package/grunt-typeset
 *
 *   @todo Add linked locations: assets: ['<%= grunt.config.get("prod.assets") %>'],
 */

module.exports = {
  options: {
    ignore: ".skip, #skip",
    disable: "",
    dest: '<%= grunt.config.get("prod.pages") %>',
  },
  src: ['<%= grunt.config.get("cache") %>/*.html'],
};
