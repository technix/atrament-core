import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';

export default (env, argv) => (
  {
    devtool: 'source-map',
    entry: {
      app: ['./src/index.js']
    },
    output: {
      path: path.resolve(__dirname, argv.mode === 'production' ? 'dist' : 'build'),
      publicPath: '/',
      filename: 'atrament.js',
      library: 'Atrament',
      libraryTarget: 'umd',
      globalObject: 'typeof self !== \'undefined\' ? self : this'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          }
        }
      ]
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          parallel: true
        })
      ]
    }
  }
);
