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
        mail: isEnvDevelopment ? [paths.appIndexJs, hotMiddlewareScript] : paths.appIndexJs
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
                {from: './public/images', to: './static/images'},
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
                    test: /\.jsx?$/,
                    loader: 'babel-loader',
                    include: [
                        path.resolve(__dirname, "../src"),
                        path.resolve(__dirname, "../../magisteria/src"),
                    ],
                    exclude: [
                        path.resolve(__dirname, "../node_modules/react-dom"),
                    ],
                    options: {
                        rootMode: "upward",
                    },
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
                // todo: Использовать такой лоадер для adm когда будет разделение проектов
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
                'tools': path.resolve(__dirname, '../../magisteria/src/tools'),
                'ducks': path.resolve(__dirname, '../../magisteria/src/ducks'),
                'actions': path.resolve(__dirname, '../../magisteria/src/actions'),
                'reducers': path.resolve(__dirname, '../../magisteria/src/reducers'),
                'containers': path.resolve(__dirname, '../../magisteria/src/containers'),
                "#src": paths.appSrc,
                "#types": path.join(paths.appSrc, '/@types'),
            }
        },
        resolveLoader: {
            alias: {
                'text': 'raw-loader',
            }
        }
    };
}
