var path = require('path'),
    webpack = require('webpack'),
    OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = {

  entry:{
     app:[ './src/app.js' ],
     lib:[ './src/lib.js' ]
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[name].js'
  },

  module: {
    rules: [
        // {
        //   enforce: 'pre',
        //   test: /\.js$/,
        //   use: {
        //     loader: 'eslint-loader',
        //     options: {
        //       emitError: false,
        //       emitWarning: true
        //     }
        //   },
        //   exclude: /(node_modules)/
        // },
      {
        test: /\.js$/,
        include: path.resolve(__dirname, "src"),
        exclude: /(node_modules)/,
        use: { loader: 'babel-loader' }
      },
      { test: /\.(glsl|vs|fs)$/, loader: 'shader-loader' },
      { test: /\.(sass|scss)$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: ['css-loader', 'sass-loader'] }) },
    ]
  },

  //devtool: "#source-map",

  devServer: {
    hot: true,
    disableHostCheck: true,
    contentBase: [ "dist" ],
    headers: { 'Access-Control-Allow-Origin': '*' }
  },

  plugins: [
    // css optimize
    new OptimizeCssAssetsPlugin(),
    new ExtractTextPlugin({
      filename: 'css/style.css'
    }),
    new JavaScriptObfuscator ({
      rotateUnicodeArray: true
    })
  ],

  //watch: true

};
