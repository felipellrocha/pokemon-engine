const webpack = require('webpack');
const path = require('path');

const paths = require('./paths');

const ManifestPlugin = require('webpack-manifest-plugin');

module.exports = {
  entry: {
    application: './src/index.js',
  },
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js',
    publicPath: 'http://0.0.0.0:8000',
  },
  resolve: {
    modules: [
      'node_modules',
      paths.src,
    ],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: require.resolve('babel-loader'),
        include: [
          paths.src,
        ],
        options: {
          cacheDirectory: true,
          presets: [
            'es2017',
            'stage-0',
            'react',
          ],
        },
      },
      {
        test: /\.css$/,
        use: [
          require.resolve('style-loader'),
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 1,
              localIdentName: '[folder]--[local]--[hash:base64:6]',
            },
          },
          { loader: require.resolve('sass-loader') },
				],
			},
      {
        test: /\.(jpg|png)$/,
        loader: require.resolve('file-loader'),
        options: {
          name: 'static/[name].[ext]',
          publicPath: '/',
        },
      },
      {
        test: /\.svg$/,
        use: {
          loader: 'raw-loader',
        }
      }
    ],
  },
  plugins: [
    new ManifestPlugin(),
  ],
};
