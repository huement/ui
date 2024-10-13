/**
 * page-data
 *
 * This is a really cool complex async multiTask that will assemble JSON files
 * from a given folder. Basically any directory + files represented as an object.
 *
 * Its mainly used to create links to each file via Pug templates.
 *
 * Its an Async task
 */
const { textUI } = require( './tui.cjs' )
const jetpack = require( 'fs-jetpack' )
const fs = require( "fs" );
const path = require( "path" );
const async = require( "async" );
const glob = require( "glob" );

class pageDataBuilder {

  constructor() {
    // var done = this.async();
    this.options = {
      indent: 2,
      target: '',
      path: '',
      url: '',
      defaultIcon: 'default'
    };
  }

  isArray( value ) {
    return Array.isArray( value );
  }
  isObject( value ) {
    return Object.prototype.toString.call( value ) === "[object Object]";
  }
  writeJson( destPath, data, indent ) {
    jetpack.write()
  }
  slugify( text ) {
    return text
      .toString()
      .toLowerCase()
      .replace( /\s+/g, "-" ) // Replace spaces with -
      .replace( /[^\w\-]+/g, "" ) // Remove all non-word chars
      .replace( /\-\-+/g, "-" ) // Replace multiple - with single -
      .replace( /^-+/, "" ) // Trim - from start of text
      .replace( /-+$/, "" ); // Trim - from end of text
  }
  capitalizeFirstLetter( string ) {
    return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
  }
  async findStringInFile( fullPath, regexString ) {
    var data = fs.readFileSync( fullPath ).toString( "utf8" );
    var dataArr = data.split( "\n" );
    const regex = new RegExp( regexString );
    if ( regex.test( data ) ) {
      for ( const line of dataArr ) {
        if ( regex.test( line ) ) {
          if ( grunt.option( "verbose" ) ) grunt.log.writeln( line );
          return line;
        }
      }
    }

    return false;
  }
  async buildNewFile( jsonFile = './web/pages/test.json' ) {
    let searchResults = [];
    let searchPath = path.resolve( process.cwd(), self.data.path );

    if ( fileExists( searchPath ) ) {
      // Optionally if we have declared a group to sort by
      let gList = options.groupBy;

      let AllFiles = jetpack.find( searchPath, {
        matching: "*.pug",
        recursive: false,
      } );

      for ( const file of AllFiles ) {
        let pageObj = {};
        let fname = capitalizeFirstLetter( path.parse( file ).name );
        let fslug = slugify( fname );
        let furl = self.data.url.replace( /\/$/, "" ) + "/" + fslug;

        let ficon = defaultIcon;
        let iconPug = await findStringInFile( file, /var\sicon\b/ );

        if ( iconPug != 0 && iconPug != undefined ) {
          // Clean Up Match
          ficon = iconPug
            .replace( "- var icon =", "" )
            .replace( '"', "" )
            .replace( '"', "" )
            .trim();
          if ( grunt.option( "verbose" ) ) grunt.log.writeln( "ICON: " + ficon );
          pageObj.icon = ficon;
        }

        // Grouping
        let fgroup = "";
        if ( gList !== false ) {
          let groupName = await findStringInFile( file, /var\sparent\b/ );
          if ( groupName != 0 && groupName != undefined ) {
            // Clean Up Match
            fgroup = groupName
              .replace( "- var parent =", "" )
              .replace( '"', "" )
              .replace( '"', "" )
              .replace( "'", "" )
              .replace( "'", "" )
              .trim();
          }
          pageObj.group = fgroup;
        }

        pageObj.name = fname;
        pageObj.url = furl;

        if ( fgroup != "" && gList[ fgroup ] ) {
          gList[ fgroup ].push( pageObj );
        } else {
          grunt.log.writeln( "No Group for: " + fname );
          searchResults.push( pageObj );
        }
      }

      // Filename is either derived from the target OR explicitly declared
      //let lastItem = self.target.substring(self.target.lastIndexOf("/") + 1);
      let finalPageName = slugify( taskTarget );
      if ( self.data.filename ) finalPageName = slugify( self.data.filename );

      let totalPages = AllFiles.length;

      let finalPage = path.resolve(
        process.cwd(),
        options.target,
        finalPageName
      );

      if ( searchResults.length > 0 ) {
        writeJson( finalPage + ".json", searchResults, options.indent );
        // grunt.log.writeln("JSON Results");
        // grunt.log.writeln(JSON.stringify(searchResults));
      } else {
        writeJson( finalPage + ".json", gList, options.indent );
        // grunt.log.writeln("JSON Results");
        // grunt.log.writeln(JSON.stringify(gList));
      }

      grunt.log.writeln( "" );
      grunt.log.ok(
        `${totalPages} pages linked up and saved to: ${finalPage}`
      );
      grunt.log.writeln( "" );
      done();
    } else {
      grunt.log.error( searchPath + " is not a valid path." );
      grunt.fail.fatal( JSON.stringify( self.data ) );
      done( false );
    }
  }
}
