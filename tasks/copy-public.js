const path = require('path');
const Task = require('./base-task.js');
const print = require('gulp-debug');

class CopyPublic extends Task {
    constructor(gulp) {
        super('copy-public', 'Copy src/public to the dist/ folder')
        this.gulp = gulp;
    }

    task() {
        return this.gulp.src(path.resolve(process.cwd(), 'src/public/**/*'))
            .pipe(print({title: 'Public File'}))
            .pipe(this.gulp.dest(path.resolve(process.cwd(), 'dist/')));
    }
}

module.exports = (gulp) => {
    return (new CopyPublic(gulp)).toArray();
}
