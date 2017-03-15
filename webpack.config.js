
const path = require('path');
// var webpack = require('webpack');

const ExtractTextPlugin = require('extract-text-webpack-plugin'); 

module.exports = {
  entry: {
    game: './src/game/client/Container.jsx',
    matching: './src/public/matching/index.js',
    // game2: './src/game/client/Container.jsx'
  },
  output: {
    path: path.resolve('public'),
    filename: '[name].js'
  },
  devtool: 'cheap-module-eval-source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: 'css-loader'
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('bundle.css')
  ]
  // plugins: [
    // new webpack.optimize.UglifyJsPlugin({
      // compress: {
        // warnings: false
      // }
    // })
  // ]
};
