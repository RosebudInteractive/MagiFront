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
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');

const NODE_ENV = process.env.NODE_ENV || 'prod';

const TARGETS = {
    main: {appHtml: path.resolve(paths.appPublic, 'html', 'main', 'index.html'), filename: 'index.html'},
    adm: {appHtml: path.resolve(paths.appPublic, 'html', 'adm', 'index.html'), filename: 'adm-index.html'},
    pm: {appHtml: path.resolve(paths.appPublic, 'html', 'team-task', 'index.html'), filename: 'pm-index.html'},
    mail: {appHtml: path.resolve(paths.appPublic, 'html', 'mailing', 'index.html'), filename: 'mail-index.html'},
    tests: {appHtml: path.resolve(paths.appPublic, 'html', 'test-app', 'index.html'), filename: 'tests-index.html'},
}

const getTargets = (params) => {
    if (!params) return TARGETS;

    const arr = params.split(',');
    if (!arr.length) return TARGETS

    const result = {};
    arr.forEach(item => {
        if (!!TARGETS[item]) {
            result[item] = TARGETS[item]
        }
    })

    return Object.keys(result).length ? result : TARGETS;
}

const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));

const hotMiddlewareScript = require.resolve(
    'react-dev-utils/webpackHotDevClient',
);

const getEntries = (isEnvDevelopment) => {
    return {
        'babel-polyfill': 'babel-polyfill',
        main: isEnvDevelopment ? ['./frontend/index', hotMiddlewareScript] : './frontend/index',
        adm: isEnvDevelopment ? ['./src/index', hotMiddlewareScript] : './src/index',
        mail: isEnvDevelopment ? ['./mailing/index', hotMiddlewareScript] : './mailing/index',
        pm: isEnvDevelopment ? ['./team-task/index', hotMiddlewareScript] : './team-task/index',
        tests: isEnvDevelopment ? ['./test-app/index', hotMiddlewareScript] : './test-app/index',
    }
}

module.exports = function (webpackEnv, argv) {
    const isEnvDevelopment = webpackEnv === 'development';
    const isEnvProduction = webpackEnv === 'production';

    const targets = TARGETS;

    const getExtOptions = (key) => {
        return key === 'main'
            ? {
                ID: isEnvProduction ? "<%- id %>" : 'null',
                EMAIL: isEnvProduction ? "<%- email %>" : 'null',
                NAME: isEnvProduction ? "<%- name %>" : 'null',
                HASH: isEnvProduction ? "<%- carrotquest_hash %>" : 'null',
                PRERENDER: isEnvProduction ? '<%- is_prerender %>' : false,
            }
            : {}
    }

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
                : isEnvDevelopment && 'static/js/[name].[chunkhash:8].bundle.js',
            publicPath: paths.publicUrlOrPath,
        },
        plugins: [
            isEnvProduction
                ? new CleanWebpackPlugin({
                    cleanStaleWebpackAssets: false,
                    cleanOnceBeforeBuildPatterns: [paths.appBuild],
                })
                : null,
            ...Object.entries(targets).map(([key, value]) => {
                return new HtmlWebpackPlugin(
                    {
                        inject: true,
                        template: value.appHtml,
                        filename: value.filename,
                        chunks: [key],
                        ...getExtOptions(key)
                    },
                )
            }),
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
                {from: './public/version.json', to: './version.json'},
                {from: './public/css', to: './static/css'},
                {from: './public/fonts', to: './static/fonts'},
                {from: './public/images', to: './static/images'},
                {from: './public/scripts', to: './static/scripts'},
                {from: './public/html/main', to: './static/favicons/main'},
                {from: './public/html/adm', to: './static/favicons/adm'},
                {from: './public/html/team-task', to: './static/favicons/team-task'},
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
                    exclude: [
                        path.resolve(__dirname, "node_modules/webix"),
                        path.resolve(__dirname, "node_modules/react-dom"),
                        path.resolve(__dirname, "timeline-lib"),
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
                {
                    test: /\.(svg)$/,
                    use: {
                        loader: 'file-loader',
                        options: {
                            name: "static/svg/[name].[hash:8].[ext]",
                            esModule: false
                        }
                    },
                }
            ]
        },
        resolve: {
            extensions: ['.js', '.jsx'],
            alias: {
                // 'react-native$': 'react-native-web',
                "underscore": path.resolve(__dirname, '../public/scripts/lib/underscore'),
                // "lodash": path.resolve(__dirname, 'scripts/lib/lodash.min'),
                "template": path.resolve(__dirname, '../public/scripts/lib/template'),
                "work-shop": path.resolve(__dirname, '../public/scripts/widgets/work-shop'),
                'jquery-ui': path.resolve(__dirname, '../public/scripts/lib/jquery-ui'),
                'script-lib': path.resolve(__dirname, '../public/scripts/lib'),
                'tt-ducks': path.resolve(__dirname, '../team-task/ducks'),
                'tt-assets': path.resolve(__dirname, '../team-task/assets'),
                'adm-ducks': path.resolve(__dirname, '../src/ducks'),
                'adm-styles': path.resolve(__dirname, '../src/styles'),
                'ducks': path.resolve(__dirname, '../frontend/ducks'),
                'actions': path.resolve(__dirname, '../frontend/actions'),
                'tools': path.resolve(__dirname, '../frontend/tools'),
                'common-tools': path.resolve(__dirname, '../common/tools'),
                'common-styles': path.resolve(__dirname, '../common/styles'),
                'timeline': path.resolve(__dirname, '../timeline-lib'),
            }
        },
        resolveLoader: {
            alias: {
                'text': 'raw-loader',
            }
        }
    };
}
