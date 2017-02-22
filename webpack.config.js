const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
var SassManifest = require('sass-manifest-webpack-plugin');


module.exports = {
    output: {
        library: 'Pairin',
        libraryTarget: 'var'
    },
    module: {
        rules: [
            {
                test: /\.(txt|base64)$/,
                use: 'raw-loader'
            },
            {
                test: /\.(sass|css|scss)$/,
                exclude: /node_modules/,
                loader: ExtractTextPlugin.extract(['css-loader', 'postcss-loader', 'sass-loader'])
            },
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader'
            },
            {
                test: /\.(eot|ttf|woff|woff2)$/,
                loader: 'file-loader',
                options: {
                    name: 'font/[name].[ext]'
                }
            },
            {
                test: /\.(jpg|jpeg|png|gif|svg)$/,
                loader: 'url-loader',
                options: {
                    name: 'images/[name].[ext]',
                    limit: 20000
                }
            }
        ]
    },
    externals: {
        mysql: 'mysql'
    },
    resolve: {
        modules: [
            path.resolve(__dirname, './src'),
            "node_modules"
        ]
    },
    plugins: [
        new ExtractTextPlugin({ filename: '[name].css', disable: false, allChunks: true }),
        new SassManifest({filename: path.resolve(__dirname, './sass-manifest.json')})
    ]
}
