const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const SassManifest = require('sass-manifest-webpack-plugin');
const fs = require('fs');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    output: {
        library: '[name]',
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
                                includePaths: [path.resolve(process.cwd(), './src')],
                                importer: function(url, prev, done) {
                                    url = path.extname(url) === '' ? url + '.scss' : url;
                                    fs.appendFile('/tmp/sass_manifest', url + '\n', 'utf8', function() {
                                        done({
                                            file: url
                                        })
                                    });
                                }
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
                test: /\.svg$/,
                loader: 'svg-inline-loader'
            },
            {
                test: /\.(jpg|jpeg|png|gif)$/,
                loader: 'url-loader',
                options: {
                    name: 'images/[name].[ext]',
                    limit: 20000
                }
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            }
        ]
    },
    externals: {
        mysql: 'mysql',
        redis: 'redis'
    },
    resolve: {
        modules: [
            path.resolve(process.cwd(), './src'),
            "node_modules"
        ]
    },
    plugins: [
        new ExtractTextPlugin({ filename: '[name].css', disable: false, allChunks: true }),
        new SassManifest({filename: path.resolve(process.cwd(), './sass-manifest.json')}),
        new HtmlWebpackPlugin({
            title: 'Pairin Internal Admin',
            inject:false,
            mobile: true,
            template: 'index.ejs',
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                conservativeCollapse: true,
                preserveLineBreaks: true
            }
        })
    ]
}
