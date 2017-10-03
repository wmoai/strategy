
const path = require('path');

const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    app: './src/game/client/Container.jsx',
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
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: 'css-loader'
        })
      },
      {
        test: /\.(jpg|png)$/,
        use: ['file-loader']
      },
    ]
  },
  plugins: [
    new ExtractTextPlugin('bundle.css'),
  ],
  // plugins: [
    // new webpack.optimize.UglifyJsPlugin({
      // compress: {
        // warnings: false
      // }
    // })
  // ]
  devServer: {
    port: 8081,
    contentBase: path.join(__dirname, 'public')
  }
};
