
const path = require("path");
const webpack = require("webpack");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const JavaScriptObfuscator = require("webpack-obfuscator");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
    app: ["./src/main.js"],
    // lib: ["./src/lib.js"]
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.[name].js"
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules/,
        use: { loader: "babel-loader" }
      },
      {
        test: /\.(glsl|vs|fs)$/,
        loader: "shader-loader"
      },
      {
        test: /\.(sass|scss)$/,
        loader: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "sass-loader"]
        })
      }
    ]
  },

  devtool: "cheap-module-source-map",

  resolve: {
    alias: {
      vue: "vue/dist/vue.min.js"
    },

    extensions: ["*", ".js", ".vue", ".json"]
  },

  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true
  },

  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),

    new OptimizeCssAssetsPlugin(),

    new ExtractTextPlugin({
      filename: "css/style.css"
    })
    // new JavaScriptObfuscator ({
    //   rotateUnicodeArray: true
    // })
  ]
};
