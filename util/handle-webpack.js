const gutil = require('gulp-util');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');

module.exports = function() {
    const config = require('../webpack.config.js');

    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
        config.plugins.push(
            new webpack.DefinePlugin({
              'process.env': {
                NODE_ENV: JSON.stringify('production')
              }
            }),
            new webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false,
                    screw_ie8: true,
                    conditionals: true,
                    unused: true,
                    comparisons: true,
                    sequences: true,
                    dead_code: true,
                    evaluate: true,
                    if_return: true,
                    join_vars: true,
                },
                output: {
                    comments: false
                },
            })
        );

        config.devtool = 'source-map';
    }

    return webpackStream(config, webpack, function(err, stats) {
        if (err) {
            throw new gutil.PluginError("webpack", err);
        }
    })
}
