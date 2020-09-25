const path = require('path');

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
            use: [
                "style-loader", // inject css into dom
                "css-loader", // take css and insert it into js
                "sass-loader" // convert sass to css
            ]
        }]
    },
    watch: true
};