require("babel-polyfill");
let path = require('path');
let webpack = require('webpack');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const getClientEnvironment = require('./env');
const paths = require('./paths');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');

const NODE_ENV = process.env.NODE_ENV || 'prod';
const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== 'false';

const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));

const hotMiddlewareScript = require.resolve(
    'react-dev-utils/webpackHotDevClient',
);

const getEntries = (isEnvDevelopment) => {
    return {
        'babel-polyfill': 'babel-polyfill',
        adm: isEnvDevelopment ? [paths.appIndexJs, hotMiddlewareScript] : paths.appIndexJs,
    }
}

module.exports = function (webpackEnv, argv) {
    const isEnvDevelopment = webpackEnv === 'development';
    const isEnvProduction = webpackEnv === 'production';

    const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

    return {
        mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
        devtool: isEnvProduction
            ? shouldUseSourceMap
                ? 'source-map'
                : false
            : isEnvDevelopment && 'cheap-module-source-map',
        entry: getEntries(isEnvDevelopment),
        output: {
            path: isEnvProduction ? paths.appBuild : undefined,
            pathinfo: isEnvDevelopment,
            filename: isEnvProduction
                ? 'static/js/[name].[chunkhash:8].js'
                : isEnvDevelopment && 'static/js/[name].[hash:8].bundle.js',
            publicPath: paths.publicUrlOrPath,
        },
        plugins: [
            isEnvProduction
                ? new CleanWebpackPlugin({
                    cleanStaleWebpackAssets: false,
                    cleanOnceBeforeBuildPatterns: [paths.appBuild],
                })
                : null,

            new HtmlWebpackPlugin(
                {

                    inject: true,
                    template: paths.appHtml,
                    ...(isEnvProduction
                        ? {
                            minify: {
                                removeComments: true,
                                collapseWhitespace: true,
                                removeRedundantAttributes: true,
                                useShortDoctype: true,
                                removeEmptyAttributes: true,
                                removeStyleLinkTypeAttributes: true,
                                keepClosingSlash: true,
                                minifyJS: true,
                                minifyCSS: true,
                                minifyURLs: true,
                            },
                        }
                        : undefined),
                },
            ),
            isEnvProduction
                && shouldInlineRuntimeChunk
                && new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime-.+[.]js/]),
            new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
            new webpack.optimize.OccurrenceOrderPlugin(),
            isEnvDevelopment ? new webpack.HotModuleReplacementPlugin() : null,
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
            }),
            new webpack.DefinePlugin({
                NODE_ENV: JSON.stringify(NODE_ENV)
            }),
            new ExtractTextPlugin('[name].css', {
                allChunks: true
            }),
            new CopyWebpackPlugin([
                {from: './public/css', to: './static/css'},
                {from: './public/fonts', to: './static/fonts'},
                {from: './public/images', to: './static/images'},
                {from: './public/scripts', to: './static/scripts'},
                {from: './public/favicon.png', to: './static/favicons/adm/'},
            ]),
        ].filter(item => item),
        optimization: {
            minimize: isEnvProduction,
            minimizer: [
                new UglifyJsPlugin({
                    test: /\.js(\?.*)?$/i,
                    parallel: true,
                    uglifyOptions: {
                        warnings: false,
                        parse: {},
                        compress: {},
                        output: null,
                    },
                })
            ],
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$|common\S*\.jsx?$/,
                    loader: 'babel-loader',
                    exclude: [
                        path.resolve(__dirname, "../node_modules"),
                    ],
                },
                {
                    loader: 'json-loader',
                    exclude: /node_modules/,
                    test: /\.json$/,
                },
                {
                    test: /\.sass$/,
                    use: [
                        // fallback to style-loader in development
                        'style-loader',
                        "css-loader",
                        "sass-loader"
                    ]
                },
                {
                    test: /\.css$/,
                    use: [
                        // fallback to style-loader in development
                        'style-loader',
                        "css-loader",
                    ]
                },
                {
                    test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
                    loader: "url-loader",
                    options: {
                        limit: 10000,
                        mimetype: 'application/font-woff',
                        name: 'static/media/[name].[hash:8].[ext]',
                    },
                },
                {
                    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                    loader: "url-loader",
                    options: {
                        limit: 10000,
                        mimetype: 'application/octet-stream',
                        name: 'static/media/[name].[hash:8].[ext]',
                    },
                },
                {
                    test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                    loader: "file-loader",
                    options: {
                        name: 'static/media/[name].[hash:8].[ext]',
                    },
                },
                {
                    test: /\.(gif|jpe?g|png|ico)$/,
                    loader: "url-loader",
                    options: {
                        limit: 10000,
                        mimetype: 'image/png+ico',
                        name: 'static/media/[name].[hash:8].[ext]',
                    },
                },
                // todo: ???????????????????????? ?????????? ???????????? ?????? adm ?????????? ?????????? ???????????????????? ????????????????
                // {
                //     test: /\.(svg)$/,
                //     use: {
                //         loader: 'file-loader',
                //         options: {
                //             name: "static/svg/[name].[hash:8].[ext]",
                //             esModule: false
                //         }
                //     },
                // }
                {
                    test: /\.svg$/,
                    use: ['@svgr/webpack'],
                },
            ]
        },
        resolve: {
            extensions: ['.js', '.jsx'],
            alias: {
                '#common': path.resolve(__dirname, '../../common'),
                'adm-ducks': path.resolve(__dirname, '../src/ducks'),
                'adm-styles': path.resolve(__dirname, '../src/assets/styles'),
                '#adm': path.resolve(__dirname, '../src'),
                '#scripts': path.resolve(__dirname, '../public/scripts'),
            }
        },
        resolveLoader: {
            alias: {
                'text': 'raw-loader',
            }
        }
    };
}
