
const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
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

  resolve: {
    alias: {
      vue: "vue/dist/vue.min.js",
      screenfull: "screenfull/dist/screenfull.js"
    },
    extensions: ["*", ".js", ".vue", ".json"]
  },

  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true
  },

  plugins: [

    new ExtractTextPlugin({
      filename: "css/style.css"
    }),

  ],

  devtool: "#cheap-module-source-map",

};

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#nosources-source-map';
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new UglifyJsPlugin({
      sourceMap: true,
      uglifyOptions: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
