"use strict";

var path = require('path');

var autoprefixer = require('autoprefixer');

module.exports = {
  entry: {
    head: "./public/js/webpack-head.js",
    script: "./public/js/webpack-scripts.js"
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "public/dist")
  },
  module: {
    rules: [{
      test: /\.scss$/,
      use: ["style-loader", // inject css into dom
      // "postcss-loader",
      "css-loader", // take css and insert it into js
      "sass-loader" // convert sass to css
      ]
    }, {
      test: /\.(png|jpg|jpeg)$/,
      loader: 'url-loader'
    }] // plugins: [
    //     new webpack.LoaderOptionsPlugin({
    //       options: {
    //         postcss: [
    //           autoprefixer(),
    //         ]
    //       }
    //     })
    //   ]

  },
  watch: true
};