let path = require('path');
let webpack = require('webpack');
let NpmInstallPlugin = require('npm-install-webpack-plugin');
// require('webpack-jquery-ui');

const NODE_ENV = process.env.NODE_ENV || 'prod';

const _prodConfig = {
    entry: {
        "babel-polyfill": "babel-polyfill",
        main: './frontend/index',
        adm: './src/index'
    },
    output: {
        path: path.join(__dirname, 'static'),
        filename: '[name].js',
    },
    resolve: {
        alias: {
            "text": './scripts/lib/text',
            "underscore": './scripts/lib/underscore',
            "lodash": './scripts/lib/lodash.min',
            "template": '/scripts/lib/template',
            "work-shop": '/scripts/widgets/work-shop'
        }
    },
    module: {
        rules: [
            {
                loaders: ['babel-loader'],
                include: [
                    path.resolve(__dirname, "src"),
                    path.resolve(__dirname, "frontend"),
                    path.resolve(__dirname, 'node_modules/whatwg-fetch'),
                ],
                // language=JSRegexp
                test: /\.js$/
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
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
    }
};

const _devConfig = {
    devtool: 'cheap-module-eval-source-map',
    entry: {
        // "webpack-jquery-ui": "webpack-jquery-ui",
        'webpack-hot-middleware/client': 'webpack-hot-middleware/client',
        'babel-polyfill': 'babel-polyfill',

        main: './frontend/index',
        adm: './src/index',
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
        })
    ],
    module: {
        rules: [
            {
                enforce: "pre",
                test: /\.js$/,
                loaders: ['eslint-loader'],
                include: [
                    path.resolve(__dirname, "src"),
                    path.resolve(__dirname, "frontend"),
                ],
                exclude: [
                    path.resolve(__dirname, 'scripts')
                ]
            },
            {
                loaders: ['react-hot-loader/webpack', 'babel-loader'], //добавили loader 'react-hot'
                include: [
                    path.resolve(__dirname, "src"),
                    path.resolve(__dirname, "frontend"),
                    path.resolve(__dirname, 'node_modules/whatwg-fetch'),
                    path.resolve(__dirname, 'node_modules/fullpage.js'),
                    path.resolve(__dirname, 'scripts/lib'),
                ],
                test: /\.js$/
            },
            {
                test: /\.css$/,
                loader: ["style-loader","css-loader"]
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
            // 'jquery': path.resolve(__dirname, 'scripts/lib/jquery/jquery-1.12.4'),
            'jquery-ui': path.resolve(__dirname, 'scripts/lib/jquery-ui'),
            'script-lib': path.resolve(__dirname, 'scripts/lib')
        }
    },
    resolveLoader: {
        alias: {
            // 'text': path.resolve(__dirname, 'scripts/lib/text'),
            'text': 'raw-loader',
        }
    }
};

module.exports = NODE_ENV === 'development' ? _devConfig : _prodConfig;
