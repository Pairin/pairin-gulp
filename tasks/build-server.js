const path = require('path');
const Task = require('./base-task.js');
const print = require('gulp-debug');
const argv = require('yargs').argv;
const babel = require('gulp-babel');
const handleError = require('../util/handle-error.js');
const getBabelConfig = require('../util/get-babel.js');
const args = require('../util/args.js');

class BuildServer extends Task {
    constructor(gulp) {
        super('build-server', 'Build the Server Files')
        this.gulp = gulp;
    }

    babelconfig() {
        const babelconfig = getBabelConfig();

        babelconfig.presets = ["react", "es2015", "stage-2"];

        babelconfig.plugins = [
            ...(babelconfig.plugins || []),
            ["babel-plugin-remove-imports", [
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
            babelconfig.plugins.push(
                path.resolve(__dirname, "../plugins/remove-devtools")
            );
        }

        return babelconfig;
    }

    task() {
        console.log(args);
        const file = argv.file || args.file || 'src/**/*.{js,json}';

        return this.gulp.src(path.resolve(process.cwd(), file), { base: './src' })
                .pipe(babel(this.babelconfig()))
                .on('error', handleError)
                .pipe(this.gulp.dest(path.resolve(process.cwd(), 'server/')))
                .pipe(print({title: 'Server Output'}));
    }

    get dependencies() {
        if (argv.clean) {
            return ['clean-server']
        }

        return [];
    }

    get args() {
        return {
            'file': 'a specific file to build',
            'clean': 'Clean the files first'
        }
    }
}

module.exports = (gulp) => {
    return (new BuildServer(gulp)).toArray();
}
