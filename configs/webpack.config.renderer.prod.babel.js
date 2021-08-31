/**
 * Build config for electron renderer process
 */

import path from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import merge from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import baseConfig from './webpack.config.base';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';
import DeleteSourceMaps from '../internals/scripts/DeleteSourceMaps';

CheckNodeEnv('production');
DeleteSourceMaps();

export default merge.smart(baseConfig, {
  devtool: process.env.DEBUG_PROD === 'true' ? 'source-map' : 'none',

  mode: 'production',

  target: 'electron-preload',

  entry: {
    main: path.join(__dirname, '..', 'app/main_window/index.tsx'),
    login: path.join(__dirname, '..', 'app/login_window/index.tsx'),
    composer: path.join(__dirname, '..', 'app/composer_window/index.tsx')
  },

  output: {
    path: path.join(__dirname, '..', 'app/dist'),
    publicPath: '../dist/',
    filename: '[name].renderer.prod.js'
  },

  module: {
    rules: [
      // Extract all .global.css to style.css as is
      {
        test: /\.global\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './'
            }
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader'
          }
        ]
      },
      // Pipe other styles through css modules and append to style.css
      {
        test: /^((?!\.global).)*\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]__[hash:base64:5]'
              },
              sourceMap: true
            }
          }
        ]
      },
      // Add SASS support  - compile all .global.scss files and pipe it to style.css
      {
        test: /\.global\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              importLoaders: 1
            }
          },
          {
            loader: 'postcss-loader'
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
                sourceMap: true
              }
            }
          }
        ]
      },
      // Add SASS support  - compile all other .scss files and pipe it to style.css
      {
        test: /^((?!\.global).)*\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]__[hash:base64:5]'
              },
              importLoaders: 1,
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader'
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
                sourceMap: true
              }
            }
          },
          {
            loader: 'text-transform-loader',
            options: {
              prependText: "@import (reference) '/app/app.global.less';\n\n"
            }
          }
        ]
      },
      // WOFF Font
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff'
          }
        }
      },
      // WOFF2 Font
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff'
          }
        }
      },
      // TTF Font
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/octet-stream'
          }
        }
      },
      // EOT Font
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: 'file-loader'
      },
      // SVG Font
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'image/svg+xml'
          }
        }
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: 'url-loader'
      }
    ]
  },

  optimization: {
    minimizer: process.env.E2E_BUILD
      ? []
      : [
          new TerserPlugin({
            parallel: true,
            sourceMap: true,
            cache: true
          }),
          new OptimizeCSSAssetsPlugin({
            cssProcessorOptions: {
              map: {
                inline: false,
                annotation: true
              }
            }
          })
        ]
  },

  plugins: [
    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    // new webpack.EnvironmentPlugin({
    //   NODE_ENV: 'production'
    //   DEBUG_PROD: false,
    //   E2E_BUILD: false
    // }),

    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),

    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true'
    })
  ]
});
