let path = require('path');
let webpack = require('webpack');
let NpmInstallPlugin = require('npm-install-webpack-plugin');
let ExtractTextPlugin = require ('extract-text-webpack-plugin');
// require('webpack-jquery-ui');

const NODE_ENV = process.env.NODE_ENV || 'prod';

const _prodConfig = {
    entry: {
        "babel-polyfill": "babel-polyfill",
        main: './frontend/index',
        adm: './src/index',
        'player-main': './scripts/player-main',
        'player-app': './scripts/player-app',
        'player-app-test': './scripts/player-app-test',
        'workshop-main': './scripts/workshop-main',
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
        new ExtractTextPlugin('player.css', {
            allChunks: true
        }),
    ],
    module: {
        rules: [
            {
                loaders: ['babel-loader'],
                include: [
                    path.resolve(__dirname, "src"),
                    path.resolve(__dirname, "frontend"),
                    path.resolve(__dirname, 'node_modules/whatwg-fetch'),
                    path.resolve(__dirname, 'node_modules/swiper'),
                    path.resolve(__dirname, 'node_modules/dom7'),
                    path.resolve(__dirname, 'node_modules/fullpage.js'),
                    path.resolve(__dirname, 'scripts/'),
                ],
                // language=JSRegexp
                test: /\.js$/
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            },
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
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url-loader?limit=10000&mimetype=image/svg+xml"
            }
        ]
    },
    resolve: {
        alias: {
            "underscore": path.resolve(__dirname, 'scripts/lib/underscore'),
            "lodash": path.resolve(__dirname, 'scripts/lib/lodash.min'),
            "template": path.resolve(__dirname, 'scripts/lib/template'),
            "work-shop": path.resolve(__dirname, 'scripts/widgets/work-shop'),
            'jquery-ui': path.resolve(__dirname, 'scripts/lib/jquery-ui'),
            'script-lib': path.resolve(__dirname, 'scripts/lib')
        }
    },
    resolveLoader: {
        alias: {
            'text': 'raw-loader',
        }
    }
};

const _devConfig = {
    devtool: 'cheap-module-eval-source-map',
    entry: {
        'webpack-hot-middleware/client': 'webpack-hot-middleware/client',
        'babel-polyfill': 'babel-polyfill',
        main: './frontend/index',
        adm: './src/index',
        'player-main': './scripts/player-main',
        'player-app': './scripts/player-app',
        'player-app-test': './scripts/player-app-test',
        'workshop-main': './scripts/workshop-main',
    },
    output: {
        path: path.join(__dirname, 'static'),
        filename: '[name].js',
        publicPath: '/static/'
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new NpmInstallPlugin(),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
        }),
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify(NODE_ENV)
        }),
        new ExtractTextPlugin('player.css', {
            allChunks: true
        }),
    ],
    module: {
        rules: [

            {
                loaders: ['react-hot-loader/webpack', 'babel-loader'], //добавили loader 'react-hot'
                include: [
                    path.resolve(__dirname, "src"),
                    path.resolve(__dirname, "frontend"),
                    path.resolve(__dirname, 'node_modules/whatwg-fetch'),
                    path.resolve(__dirname, 'node_modules/swiper'),
                    path.resolve(__dirname, 'node_modules/dom7'),
                    path.resolve(__dirname, 'node_modules/fullpage.js'),
                    path.resolve(__dirname, 'scripts/'),
                    path.resolve(__dirname, 'scripts/widgets/player.js'),
                ],
                test: /\.js$/
            },
            {
                test: /\.css$/,
                // loader: ["style-loader", "css-loader"]
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            },
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
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url-loader?limit=10000&mimetype=image/svg+xml"
            }
        ]
    },
    resolve: {
        alias: {
            "underscore": path.resolve(__dirname, 'scripts/lib/underscore'),
            "lodash": path.resolve(__dirname, 'scripts/lib/lodash.min'),
            "template": path.resolve(__dirname, 'scripts/lib/template'),
            "work-shop": path.resolve(__dirname, 'scripts/widgets/work-shop'),
            'jquery-ui': path.resolve(__dirname, 'scripts/lib/jquery-ui'),
            'script-lib': path.resolve(__dirname, 'scripts/lib')
        }
    },
    resolveLoader: {
        alias: {
            'text': 'raw-loader',
        }
    }
};

module.exports = NODE_ENV === 'development' ? _devConfig : _prodConfig;
