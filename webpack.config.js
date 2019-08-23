const pkg = require("./package.json");
const env = require("yargs").argv.env;
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
var TerserPlugin = require("terser-webpack-plugin");

let libraryName = pkg.name;

let outputFile, mode;

if (env === "build") {
  mode = "production";
  outputFile = libraryName + ".min.js";
} else {
  mode = "development";
  outputFile = libraryName + ".js";
}

module.exports = {
  entry: [__dirname + "/src/index.js"],
  mode: mode,
  output: {
    path: __dirname + "/dist",
    filename: outputFile,
    library: libraryName,
    libraryTarget: "umd",
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      openAnalyzer: false
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        sourceMap: true
      })
    ]
  }
};
