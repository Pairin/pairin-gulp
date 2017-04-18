const Path = require('path');
const Task = require('./base-task.js');
const archiver = require('gulp-archiver');

class Bundle extends Task {
    constructor(gulp) {
        super('bundle', 'Bundle the application');

        this.gulp = gulp;
    }

    task() {
        return this.gulp.src([
            path.resolve(process.cwd(), 'server*/**'),
            path.resolve(process.cwd(), 'dist*/**'),
            path.resolve(process.cwd(), 'index.js'),
            path.resolve(process.cwd(), 'package.json'),
            path.resolve(process.cwd(), 'npm-shrinkwrap.json'),
            path.resolve(process.cwd(), '.ebextensions*/**'),
        ]).pipe(archiver('bundle.zip'))
        .pipe(this.gulp.dest(process.cwd()))
    }
}

module.exports = (gulp) => {
    return (new Bundle(gulp)).toArray();
}
