var path = require('path');

module.exports = {
  entry: './entry.jsx',
  output: {
    path: path.resolve('dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        options: {
          presets: ['es2015', 'react']
        }
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.(jpg|png)$/,
        loaders: 'file-loader'
      },
    ]
  },
  devServer: {
    proxy: {
      '/image': 'http://localhost:8081'
    }
  }
};
