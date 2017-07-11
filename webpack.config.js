var path = require('path');
var webpack = require('webpack');

module.exports = {
  
  entry:{
     app:[ 
       './src/app.js' 
     ]
  },
  
  output: {
    path: path.resolve(__dirname, 'build'), 
    filename: 'sqr.[name].js'
  },
  module: {
    rules: [
      { test: /\.(glsl|vs|fs)$/, loader: 'shader-loader' },
      { test: /\.css$/, loader: "style-loader!css-loader" }
    ]
  }
};
