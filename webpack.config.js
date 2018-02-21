let path = require('path');
let webpack = require('webpack');
let NpmInstallPlugin = require('npm-install-webpack-plugin');

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
        new NpmInstallPlugin()
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
            },
            {
                loaders: ['react-hot-loader/webpack', 'babel-loader'], //добавили loader 'react-hot'
                include: [
                    path.resolve(__dirname, "src"),
                    path.resolve(__dirname, "frontend"),
                    path.resolve(__dirname, 'node_modules/whatwg-fetch'),
                ],
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

module.exports = NODE_ENV === 'development' ? _devConfig : _prodConfig;
