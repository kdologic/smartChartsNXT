const path = require("path");
let webpack = require("webpack");

module.exports = {
  //entry: [ 'babel-polyfill'],// './src/main'],
  module: {
    loaders: [{
      loader: "babel-loader",
      exclude: [
        path.resolve(__dirname, "node_modules")
      ],
      query: {
        plugins: [
          ["transform-react-jsx", {
            "pragma": "h" // default pragma is React.createElement
          }],
          ['transform-runtime']
        ],
        presets: ['es2015']
      }
    }]
  }
};