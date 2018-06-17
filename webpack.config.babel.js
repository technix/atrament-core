import path from 'path';
import webpack from 'webpack'; // eslint-disable-line import/no-extraneous-dependencies

export default (env = {production: false}) => {
  const webpackPlugins = (() => {
    const wpPlugins = [];
    if (env.production) {
      wpPlugins.push(new webpack.optimize.UglifyJsPlugin({
        mangle: {
          except: ['Container']
        }
      }));
      wpPlugins.push(new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"'
        }
      }));
    }
    return wpPlugins;
  })();

  return {
    devtool: 'sourcemap',
    entry: {
      app: ['./src/index.js']
    },
    output: {
      path: path.resolve(__dirname, 'build'),
      publicPath: '/',
      filename: 'atrament.js',
      library: 'Atrament',
      libraryTarget: 'umd'
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'babel-loader'
        }
      ]
    },
    plugins: webpackPlugins
  };
};
