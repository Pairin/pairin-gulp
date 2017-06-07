const path = require('path');
const Task = require('./base-task.js');
const print = require('gulp-debug');
const argv = require('yargs').argv;
const babel = require('gulp-babel');
const handleError = require('../util/handle-error.js');
const getBabelConfig = require('../util/get-babel.js');
const args = require('../util/args.js');

class BuildWorker extends Task {
    constructor(gulp) {
        super('build-worker', 'Build the Service Worker')
        this.gulp = gulp;
    }

    get babelconfig() {
        const babelconfig = getBabelConfig();

        babelconfig.presets = ["react", "es2015", "stage-2"];

        babelconfig.plugins = [
            ...(babelconfig.plugins || []),
            ["babel-plugin-remove-imports", [
                /\.(js|json)$/,
                /\.(less|css|sass|scss)$/,
                /\.(jpeg|jpg|png|gif|svg)$/
            ]],
            [
                "transform-runtime",
                {
                  "polyfill": false,
                  "regenerator": true
                }
            ]
        ];

        if (process.env.NODE_ENV !== 'development') {
            babelconfig.plugins.unshift(
                path.resolve(__dirname, "../plugins/remove-devtools")
            );
        }

        return babelconfig;
    }

    task() {
        return this.gulp.src([path.resolve(process.cwd(), 'src/worker.js')], { base: './src' })
                .pipe(babel(this.babelconfig))
                .on('error', handleError)
                .pipe(this.gulp.dest(path.resolve(process.cwd(), 'dist/')))
                .pipe(print({title: 'Worker Output'}));
    }

    get dependencies() {
        return [];
    }

    get args() {
        return {
        }
    }
}

module.exports = (gulp) => {
    return (new BuildWorker(gulp)).toArray();
}
