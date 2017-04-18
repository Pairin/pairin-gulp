const path = require('path');
const Task = require('./base-task.js');
const rename = require('gulp-rename');
const fontello = require('gulp-fontello');
const print = require('gulp-debug');

class FetchFontello extends Task {
    constructor(gulp) {
        super('fetch-fontello', 'Fetch the fontello files')
        this.gulp = gulp;
    }

    task() {
        return this.gulp.src('fontello.json', {base: process.cwd()})
                .pipe(fontello({
                    font: 'src/fonts/fontello',
                    css: 'src/styles/fontello',
                    assetsOnly: true
                }))
                .pipe(rename(function (p) {
                    if (p.extname === '.css') {
                        p.extname = '.scss';
                    }
                }))
                .pipe(this.gulp.dest(process.cwd()))
                .pipe(print({title: 'Fetch Fontello'}));
    }
}

module.exports = (gulp) => {
    return (new FetchFontello(gulp)).toArray();
}
