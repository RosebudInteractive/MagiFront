require("babel-polyfill");
let path = require('path');
let webpack = require('webpack');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV || 'prod';

const _prodConfig = {
    entry: {
        "babel-polyfill": "babel-polyfill",
        main: './frontend/index',
        adm: './src/index',
        mailing: './mailing/index',
        'player-main': './scripts/player-main',
        'player-app': './scripts/native-app-player/player-app',
        'player-app-test': './scripts/native-app-player/example',
        'workshop-main': './scripts/workshop-main',
        "team-task": './team-task/index',
        "test-app": './test-app/index',
    },
    output: {
        path: path.join(__dirname, 'static'),
        filename: '[name].js',
    },
    plugins: [
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
        new CopyWebpackPlugin([{from: './frontend/version.json', to: './version.json'}])
    ],
    optimization: {
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
                loaders: ['babel-loader'],
                exclude: [
                    path.resolve(__dirname, "node_modules/webix"),
                    path.resolve(__dirname, "node_modules/react-dom"),
                ],
                // language=JSRegexp
                test: /\.js$/
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
                    'style-loader',
                    "css-loader",
                ]
            },
            // {
            //     test: /\.css$/,
            //     use: ExtractTextPlugin.extract({
            //         fallback: "style-loader",
            //         use: "css-loader"
            //     })
            // },
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url-loader?limit=10000&mimetype=application/font-woff"
            },
            {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url-loader?limit=10000&mimetype=application/font-woff"
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url-loader?limit=10000&mimetype=application/octet-stream"
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: "file-loader"
            },
            {
                test: /\.(gif|jpe?g|png|ico)$/,
                loader: "url-loader?limit=10000&mimetype=image/png+ico"
            },
            // {
            //     test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
            //     loader: "url-loader?limit=10000&mimetype=image/svg+xml"
            // },
            {
                test: /\.svg$/,
                use: ['@svgr/webpack'],
            },
        ]
    },
    resolve: {
        alias: {
            "underscore": path.resolve(__dirname, 'scripts/lib/underscore'),
            // "lodash": path.resolve(__dirname, 'scripts/lib/lodash.min'),
            "template": path.resolve(__dirname, 'scripts/lib/template'),
            "work-shop": path.resolve(__dirname, 'scripts/widgets/work-shop'),
            'jquery-ui': path.resolve(__dirname, 'scripts/lib/jquery-ui'),
            'script-lib': path.resolve(__dirname, 'scripts/lib'),
            'tt-ducks': path.resolve(__dirname, 'team-task/ducks'),
            'tt-assets': path.resolve(__dirname, 'team-task/assets'),
            'adm-ducks': path.resolve(__dirname, 'src/ducks'),
            'adm-styles': path.resolve(__dirname, 'src/styles'),
            'ducks': path.resolve(__dirname, 'frontend/ducks'),
            'actions': path.resolve(__dirname, 'frontend/actions'),
            'tools': path.resolve(__dirname, 'frontend/tools'),
            'common-tools': path.resolve(__dirname, 'common/tools'),
            'common-styles': path.resolve(__dirname, 'common/styles'),
        }
    },
    resolveLoader: {
        alias: {
            'text': 'raw-loader',
        }
    }
};


const hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';
const _devConfig = {
    mode: 'development',
    devtool: 'cheap-module-eval-source-map',
    entry: {
        'babel-polyfill': 'babel-polyfill',
        'webpack-hot-middleware/client': 'webpack-hot-middleware/client',
        main: ['./frontend/index', hotMiddlewareScript],
        adm: ['./src/index', hotMiddlewareScript],
        mailing: ['./mailing/index', hotMiddlewareScript],
        "team-task": ['./team-task/index', hotMiddlewareScript],
        "test-app": ['./test-app/index', hotMiddlewareScript],
        'player-main': ['./scripts/player-main', hotMiddlewareScript],
        'player-app': ['./scripts/native-app-player/player-app', hotMiddlewareScript],
        'player-app-test': ['./scripts/native-app-player/example', hotMiddlewareScript],
        'workshop-main': ['./scripts/workshop-main', hotMiddlewareScript],
    },
    output: {
        path: path.join(__dirname, 'static'),
        filename: '[name].js',
        publicPath: '/static/'
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        // new NpmInstallPlugin(),
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
        new CopyWebpackPlugin([{from: './frontend/version.json', to: './version.json'}]),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: [
                    path.resolve(__dirname, "node_modules/webix"),
                    path.resolve(__dirname, "node_modules/react-dom"),
                ],
            },
            {
                loader: 'json-loader',
                exclude: /node_modules/,
                test: /\.json$/,
            },
            {
                test: /\.sass$/,
                // test: /\.scss$/,
                use: [
                    // fallback to style-loader in development
                    'style-loader',
                    "css-loader",
                    "sass-loader"
                ]
            },
            {
                test: /\.css$/,
                // test: /\.scss$/,
                use: [
                    // fallback to style-loader in development
                    'style-loader',
                    "css-loader",
                ]
            },
            // {
            //     test: /\.css$/,
            //     // loader: ["style-loader", "css-loader"]
            //     use: ExtractTextPlugin.extract({
            //         fallback: "style-loader",
            //         use: "css-loader"
            //     })
            // },
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url-loader?limit=10000&mimetype=application/font-woff"
            },
            {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url-loader?limit=10000&mimetype=application/font-woff"
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url-loader?limit=10000&mimetype=application/octet-stream"
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: "file-loader"
            },
            {
                test: /\.(gif|jpe?g|png|ico)$/,
                loader: "url-loader?limit=10000&mimetype=image/png+ico"
            },
            // {
            //     test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
            //     loader: "url-loader?limit=10000&mimetype=image/svg+xml"
            // }
            {
                test: /\.svg$/,
                use: ['@svgr/webpack'],
            },
        ]
    },
    resolve: {
        alias: {
            "underscore": path.resolve(__dirname, 'scripts/lib/underscore'),
            // "lodash": path.resolve(__dirname, 'scripts/lib/lodash.min'),
            "template": path.resolve(__dirname, 'scripts/lib/template'),
            "work-shop": path.resolve(__dirname, 'scripts/widgets/work-shop'),
            'jquery-ui': path.resolve(__dirname, 'scripts/lib/jquery-ui'),
            'script-lib': path.resolve(__dirname, 'scripts/lib'),
            'tt-ducks': path.resolve(__dirname, 'team-task/ducks'),
            'tt-assets': path.resolve(__dirname, 'team-task/assets'),
            'adm-ducks': path.resolve(__dirname, 'src/ducks'),
            'adm-styles': path.resolve(__dirname, 'src/styles'),
            'ducks': path.resolve(__dirname, 'frontend/ducks'),
            'actions': path.resolve(__dirname, 'frontend/actions'),
            'tools': path.resolve(__dirname, 'frontend/tools'),
            'common-tools': path.resolve(__dirname, 'common/tools'),
            'common-styles': path.resolve(__dirname, 'common/styles'),
        }
    },
    resolveLoader: {
        alias: {
            'text': 'raw-loader',
        }
    }
};

module.exports = NODE_ENV === 'development' ? _devConfig : _prodConfig;
