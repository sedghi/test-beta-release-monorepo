const { merge } = require('webpack-merge');
const path = require('path');
const webpackCommon = require('./../../../.webpack/webpack.common.js');
const webpackBundleAnalyzer = require('webpack-bundle-analyzer');
const pkg = require('./../package.json');

module.exports = (env, argv) => {
  const commonConfig = webpackCommon(env, argv);

  return merge(commonConfig, {
    devtool: 'source-map',
    entry: {
      lib: path.join(__dirname, '../src/index.ts'),
    },
    output: {
      path: path.join(__dirname, '../dist/umd'),
      library: 'cornerstoneTools3D',
      libraryTarget: 'umd',
      filename: 'index.js',
    },
    stats: {
      colors: true,
      hash: true,
      timings: true,
      assets: true,
      chunks: false,
      chunkModules: false,
      modules: false,
      children: false,
      warnings: true,
    },
    optimization: {
      minimize: true,
    },
    externals: [
      {
        '@alireza-beta-monorepo/core': {
          root: 'cornerstone3D',
          commonjs: '@alireza-beta-monorepo/core',
          commonjs2: '@alireza-beta-monorepo/core',
          amd: '@alireza-beta-monorepo/core',
        },
        '@alireza-beta-monorepo/streaming-image-volume-loader': {
          root: 'cornerstoneStreamingImageVolumeLoader',
          commonjs: '@alireza-beta-monorepo/streaming-image-volume-loader',
          commonjs2: '@alireza-beta-monorepo/streaming-image-volume-loader',
          amd: '@alireza-beta-monorepo/streaming-image-volume-loader',
        },
        'gl-matrix': {
          root: 'window',
          commonjs: 'gl-matrix',
          commonjs2: 'gl-matrix',
          amd: 'gl-matrix',
        },
      },
    ],

    // plugins: [new webpackBundleAnalyzer.BundleAnalyzerPlugin()],
  });
};
