const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const moduleFileExtensions = [
  '.web.mjs',
  '.mjs',
  '.web.js',
  '.js',
  '.web.ts',
  '.ts',
  '.web.tsx',
  '.tsx',
  '.json',
  '.web.jsx',
  '.jsx',
];

const config = {
  target: 'web',
  entry: {
    index: './src/index.ts',
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index.js',
    library: 'test',
    libraryTarget: 'umd',
    globalObject: 'this',
    umdNamedDefine: true,
  },
  watchOptions: {
    aggregateTimeout: 600,
    ignored: /node_modules/,
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
      cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, './dist')],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: [/node_modules/, /test/],
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'ts-loader',
          },
        ],
      },
      {
        test: /\.js(x?)$/,
        exclude: [/node_modules/, /test/],
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        // test: /\.s?css$/,
        test: /\.(s?css|sass)$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: { implementation: require('sass') },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: moduleFileExtensions,
    mainFields: ['main:src', 'module', 'main', 'browser'],
    alias: {
      'react-native$': 'react-native-web',
      'react-dom$': 'react-dom/profiling',
      'scheduler/tracing': 'scheduler/tracing-profiling',
    },
  },
  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react'
    },
    'react-dom': {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom'
    }
  },
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    // * add some development rules here
  } else if (argv.mode === 'production') {
    // * add some prod rules here
  } else {
    throw new Error('Specify env');
  }

  return config;
};
