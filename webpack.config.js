const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const SassManifest = require('sass-manifest-webpack-plugin');
const fs = require('fs');

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
                use: ExtractTextPlugin.extract({
                    use: [
                        {
                            loader: 'css-loader'
                        },
                        {
                            loader: 'postcss-loader'
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                includePaths: [path.resolve(process.cwd(), './src')]
                            }
                        }
                    ]
                })
            },
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                options: {
                    env: {
                        production: {
                            plugins: [
                                path.resolve(__dirname, "./plugins/remove-devtools")
                            ]
                        }
                    }
                }
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
            path.resolve(process.cwd(), './src'),
            "node_modules"
        ]
    },
    plugins: [
        new ExtractTextPlugin({ filename: '[name].css', disable: false, allChunks: true }),
        new SassManifest({filename: path.resolve(process.cwd(), './sass-manifest.json')})
    ]
}
