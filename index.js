const gulp = require('gulp-help')(require('gulp'), {hideEmpty: true});
const argv = require('yargs').alias('e', 'env').array('env').argv;
const args = require('./util/args.js');

process.env.NODE_ENV = process.env.BABLE_ENV = (argv.environment || process.env.BUILD_ENV || 'development');

if (argv.env && argv.env.length) {
    argv.env.forEach((arg) => {
        const [key,val] = arg.split('=',2);

        process.env[key] = val;
    })
}

for(var key in argv) {
    args[key] = argv[key];
}

module.exports = (ENV) => {

    /* Build            */ gulp.task(...(require('./tasks/build-task.js')(gulp)));
    /* Build Client     */ gulp.task(...(require('./tasks/build-client.js')(gulp)));
    /* Build Server     */ gulp.task(...(require('./tasks/build-server.js')(gulp)));
    /* Bundle           */ gulp.task(...(require('./tasks/bundle.js')(gulp)));
    /* Clean Server     */ gulp.task(...(require('./tasks/clean-server.js')(gulp)));
    /* Copy Public      */ gulp.task(...(require('./tasks/copy-public.js')(gulp)));
    /* Fetch Fontello   */ gulp.task(...(require('./tasks/fetch-fontello.js')(gulp)));
    /* Fontello         */ gulp.task(...(require('./tasks/fontello.js')(gulp)));
    /* Fontello Client  */ gulp.task(...(require('./tasks/fontello-client.js')(gulp)));

    /* Watch            */ gulp.task(...(require('./tasks/watch.js')(gulp)));

    gulp.task('default', ['help']);
    return gulp;
}
