const path = require('path');
const Task = require('./base-task.js');
const rename = require('gulp-rename');

class Fontello extends Task {
    constructor(gulp) {
        super('fontello', 'Build the Fontello Files')
        this.gulp = gulp;
    }

    task() {
        return this.gulp.src('src/fonts/**/*', {base: process.cwd()})
                .pipe(rename((p) => {
                    p.dirname=path.relative('src/fonts', p.dirname);
                }))
                .pipe(this.gulp.dest('dist/fonts'));
    }

    get dependencies() {
        return ['fetch-fontello'];
    }
}

module.exports = (gulp) => {
    return (new Fontello(gulp)).toArray();
}
