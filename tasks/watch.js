const path = require('path');
const Task = require('./base-task.js');
const argv = require('yargs').argv;

class Watch extends Task {
    constructor(gulp) {
        super('watch', 'Watch for file changes')
        this.gulp = gulp;
    }

    task() {
        let buildWatcher = this.gulp.watch(['src/**/*.{js,json}','src/*.{js,json}'], ['build-client']);

        this.gulp.watch('src/**/*.{less,scss,css,jpeg,jpg,png,gif}', ['build-client']);
        this.gulp.watch('fontello.json', ['fontello-client']);
        this.gulp.watch('public/**/*', ['copy-public']);

        buildWatcher.on('change', (event) => {
            argv.file = event.path;

            let run = ['build-server'];

            if (event.type === 'deleted') {
                run = ['clean-server'];
            }

            this.gulp.start.apply(this.gulp, run);
        })
    }

    get dependencies() {
        return ['copy-public','fontello-client', 'build-server'];
    }
}

module.exports = (gulp) => {
    return (new Watch(gulp)).toArray();
}
