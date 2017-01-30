var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    devtool: 'sourcemap',
    entry: {
        app: ['./src/index.js']
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        publicPath: '/',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.css/,
                loader: ExtractTextPlugin.extract('style', 'css')
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file'
            },
            {
                test: /\.html$/,
                loader: 'raw'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: 'body'
        }),
        new ExtractTextPlugin('styles.css'),
        new webpack.optimize.CommonsChunkPlugin(
            /* chunkName= */ 'vendor',
            /* filename= */ 'vendor.js',
            function isNodeModule(module) {
                return module.resource &&
                    module.resource.indexOf('.js') !== -1 &&
                    module.resource.indexOf(path.join(__dirname, 'node_modules')) !== -1;
            }
        )
    ],
    devServer: {
        contentBase: './src/assets',
        stats: 'minimal'
    }
};
