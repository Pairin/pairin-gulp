const path = require('path');
const Task = require('./base-task.js');
const print = require('gulp-debug');
const named = require('vinyl-named');
const handleWebpack = require('../util/handle-webpack.js');
const handleError = require('../util/handle-error.js');
const argv = require('yargs').argv;

class BuildClient extends Task {
    constructor(gulp) {
        super('build-client', 'Build the Client')
        this.gulp = gulp;

        this.withFontello = argv.fontello;
    }

    task() {
        return this.gulp.src(path.resolve(process.cwd(), 'src/client.js'))
            .pipe(named())
            .pipe(handleWebpack())
            .on('error', handleError)
            .pipe(this.gulp.dest(path.resolve(process.cwd(), 'dist/')))
            .pipe(print({title: 'Client Output'}));
    }

    get args() {
        return {
            'fontello': 'Build with fontello'
        }
    }

    get dependencies() {
        if (this.withFontello) {
            return ['fontello'];
        }
        return [];
    }
}

module.exports = (gulp) => {
    return (new BuildClient(gulp)).toArray();
}
