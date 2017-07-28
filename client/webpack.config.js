var webpack = require('webpack')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  entry: {
    app: './src/main.js',
    vendor: ['react', 'react-dom', 'react-router']
  },
  output: {
    filename: 'bundle.js',
    path: __dirname + '/build/js'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
        name: "vendor",
        filename: "vendor.js",
    }),
	new UglifyJSPlugin({})
  ],
  module: {
    loaders: [
      {
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react']
        }
      },
    ]
  },

  devtool: "source-map",

};
