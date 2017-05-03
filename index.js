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

    for(var key in ENV) {
        process.env[key] = ENV[key];
    }

    /* Build            */ gulp.task(...(require('./tasks/build-task.js')(gulp)));
    /* Build Client     */ gulp.task(...(require('./tasks/build-client.js')(gulp)));
    /* Build Server     */ gulp.task(...(require('./tasks/build-server.js')(gulp)));
    /* Bundle           */ gulp.task(...(require('./tasks/bundle.js')(gulp)));
    /* Clean Server     */ gulp.task(...(require('./tasks/clean-server.js')(gulp)));
    /* Copy Public      */ gulp.task(...(require('./tasks/copy-public.js')(gulp)));
    /* Fetch Fontello   */ gulp.task(...(require('./tasks/fetch-fontello.js')(gulp)));
    /* Fontello         */ gulp.task(...(require('./tasks/fontello.js')(gulp)));
    /* Fontello Client  */ gulp.task(...(require('./tasks/fontello-client.js')(gulp)));

    /* Upload           */ gulp.task(...(require('./task/upload.js')(gulp)));
    /* Upload Manifest  */ gulp.task(...(require('./task/upload-manifest.js')(gulp)));
    /* Upload Assets    */ gulp.task(...(require('./task/upload-assets.js')(gulp)));
    /* Upload Styles    */ gulp.task(...(require('./task/upload-styles.js')(gulp)));

    /* Deploy           */ gulp.task(...(require('./task/deploy.js')(gulp)));

    /* Invalidate Cache */ gulp.task(...(require('./task/invalidate-cache.js')(gulp)));

    /* Watch            */ gulp.task(...(require('./tasks/watch.js')(gulp)));

    gulp.task('default', ['help']);
    return gulp;
}
