module.exports = {
  map: {
    inline: false,
    annotation: true,
    sourcesContent: true,
  },
  plugins: {
    'postcss-import': {},
    'postcss-preset-env': {
      stage: 3,
      features: {
        'nesting-rules': true,
      },
    },
    'postcss-flexbugs-fixes': {},
    cssnano: {
      preset: 'default',
    },
    autoprefixer: {
      cascade: false,
    },
  },
}
