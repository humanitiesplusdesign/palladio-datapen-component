const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'palladio-datapen-view.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader',
          options: {
            attrs: [':data-src']
          }
        }
      }
    ]
  }
};