import path from 'path';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';

export default (env, argv) => {
  return {
    devtool: 'sourcemap',
    entry: {
      app: ['./src/index.js']
    },
    output: {
      path: path.resolve(__dirname, argv.mode === 'production' ? 'dist' : 'build'),
      publicPath: '/',
      filename: 'atrament.js',
      library: 'Atrament',
      libraryTarget: 'umd',
      globalObject: 'typeof self !== \'undefined\' ? self : this',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader?cacheDirectory'
        }
      ]
    },
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          sourceMap: true,
          uglifyOptions: {
            mangle: {
              reserved: ['Container']
            }
          }
        })
      ]
    }
  };
};