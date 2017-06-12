const path = require('path');
const Task = require('./base-task.js');
const print = require('gulp-debug');
const named = require('vinyl-named');
const handleWebpack = require('../util/handle-webpack.js');
const handleError = require('../util/handle-error.js');
const argv = require('yargs').argv;
const Stream = require('stream');

const setFileName = () => {
    const stream = new Stream.Transform({objectMode: true});

    stream._transform = (data, unused, cb) => {
        const name = path.basename(data.path, path.extname(data.path));
        switch (name) {
            case 'client':
                data.named = 'Pairin';
                break;
            default:
                data.named = `Pairin_${name}`;
        }
        cb(null, data);
    }

    return stream;
}
const cleanFileName = () => {
    const stream = new Stream.Transform({objectMode: true});

    stream._transform = (data, unused, cb) => {
        const name = path.basename(data.path, path.extname(data.path));
        switch (name) {
            case 'Pairin':
                data.named = 'client';
                break;
            default:
                data.named = name.replace(/^Pairin_/, '');
        }
        data.path = path.resolve(path.dirname(data.path), data.named + path.extname(data.path));

        cb(null, data);
    }

    return stream;
}

class BuildClient extends Task {
    constructor(gulp) {
        super('build-client', 'Build the Client')
        this.gulp = gulp;

        this.withFontello = argv.fontello;
    }

    task() {
        return this.gulp.src([path.resolve(process.cwd(), 'src/client.js')])
            // .pipe(named())
            .pipe(setFileName())
            .pipe(handleWebpack())
            .pipe(cleanFileName())
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
