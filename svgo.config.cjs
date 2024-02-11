module.exports = {
  multipass: true,
  js2svg: {
    indent: 2,
    pretty: true,
  },
  plugins: [
		{
			name: "convertPathData",
      params: { noSpaceAfterFlags: false }
  	},
		{
			name: "mergePaths",
      params: { noSpaceAfterFlags: false }
  	},
    "preset-default",
    "removeDimensions",
    {
      name: "sortAttrs",
      params: {
        xmlnsOrder: "alphabetical",
      },
    },
  ],
};