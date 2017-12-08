const webpack = require('webpack');
const path = require('path');

const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    bundle: './src/frontend/index.jsx',
    // app: './src/game/client/',
  },
  output: {
    path: path.resolve('public'),
    filename: '[name].js'
  },
  // devtool: 'cheap-module-eval-source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: 'css-loader'
        })
      },
    ]
  },
  plugins: [
    new ExtractTextPlugin('bundle.css'),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
  ],
  devServer: {
    port: 8081,
    contentBase: path.join(__dirname, 'public')
  }
};
