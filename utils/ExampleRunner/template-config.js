const path = require('path');

const csRenderBasePath = path.resolve('packages/core/src/index');
const csToolsBasePath = path.resolve('packages/tools/src/index');
const csStreamingBasePath = path.resolve(
  'packages/streaming-image-volume-loader/src/index'
);
const csDICOMImageLoaderDistPath = path.resolve(
  'packages/dicomImageLoader/dist/dynamic-import/cornerstoneDICOMImageLoader.min.js'
);

module.exports = function buildConfig(
  name,
  relPath,
  destPath,
  root,
  exampleBasePath
) {
  console.log('root=', root);
  return `
// THIS FILE IS AUTOGENERATED - DO NOT EDIT
var path = require('path')

var rules = require('./rules-examples.js');
var modules = [path.resolve('../node_modules/'), path.resolve('../../../node_modules/')];

var HtmlWebpackPlugin = require('html-webpack-plugin');
var ESLintPlugin = require('eslint-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

var webpack = require('webpack');
var path = require('path');
module.exports = {
  mode: 'development',
  devtool: 'source-map',
  plugins: [
    new ESLintPlugin(),
    new HtmlWebpackPlugin({
      template: '${root.replace(/\\/g, '/')}/utils/ExampleRunner/template.html',
    }),
    new webpack.DefinePlugin({
      __BASE_PATH__: "''",
    }),
    new CopyPlugin({
      patterns: [
        {
          from:
            '../../../node_modules/@alireza-test-monorepo/dicom-image-loader/dist/dynamic-import',
          to: '${destPath.replace(/\\/g, '/')}',
        },
      ],
    }),
    // new BundleAnalyzerPlugin()
  ],
  entry: path.join('${exampleBasePath.replace(/\\/g, '/')}', '${relPath.replace(
    /\\/g,
    '/'
  )}'),
  output: {
    path: '${destPath.replace(/\\/g, '/')}',
    filename: '${name}.js',
  },
  module: {
    rules,
  },
  resolve: {
    alias: {
      '@alireza-beta-monorepo/core': '${csRenderBasePath.replace(/\\/g, '/')}',
      '@alireza-beta-monorepo/tools': '${csToolsBasePath.replace(/\\/g, '/')}',
      '@alireza-beta-monorepo/streaming-image-volume-loader': '${csStreamingBasePath.replace(
        /\\/g,
        '//'
      )}',
      // We use this alias and the CopyPlugin to support using the dynamic-import version
      // of WADO Image Loader
      '@alireza-beta-monorepo/dicom-image-loader': '${csDICOMImageLoaderDistPath.replace(
        /\\/g,
        '/'
      )}'
    },
    modules,
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
      events: false
    },
  },
  devServer: {
    hot: true,
    open: false,
    port: 3000,
    historyApiFallback: true,
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin"
    }
  },
  /*optimization: {
    minimize: false,
    usedExports: true,
    sideEffects: true
  }*/
};
`;
};
