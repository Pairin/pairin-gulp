const gulp = require('gulp-help')(require('gulp'), {hideEmpty: true});
const argv = require('yargs').alias('e', 'env').default('env', '__VERSION__=dev').array('env').argv;
const args = require('./util/args.js');

//Set the command line arguments
const a = {};
argv.env.forEach((arg) => {
    const [key,val] = arg.split('=', 2);
    a[key] = val;
});
argv.env = a;

argv.env.__VERSION__ = argv.env.__VERSION__ || 'dev';

process.env.NODE_ENV = process.env.BABEL_ENV = (argv.environment || process.env.BUILD_ENV || 'development');

module.exports = (ENV) => {

    for(var key in ENV) {
        process.env[key] = ENV[key];
    }

    process.env = Object.assign({}, process.env, argv.env);

    /* Build            */ gulp.task(...(require('./tasks/build-task.js')(gulp)));
    /* Build Client     */ gulp.task(...(require('./tasks/build-client.js')(gulp)));
    /* Build Client     */ gulp.task(...(require('./tasks/build-worker.js')(gulp)));
    /* Build Server     */ gulp.task(...(require('./tasks/build-server.js')(gulp)));
    /* Bundle           */ gulp.task(...(require('./tasks/bundle.js')(gulp)));
    /* Clean Server     */ gulp.task(...(require('./tasks/clean-server.js')(gulp)));
    /* Copy Public      */ gulp.task(...(require('./tasks/copy-public.js')(gulp)));
    /* Fetch Fontello   */ gulp.task(...(require('./tasks/fetch-fontello.js')(gulp)));
    /* Fontello         */ gulp.task(...(require('./tasks/fontello.js')(gulp)));
    /* Fontello Client  */ gulp.task(...(require('./tasks/fontello-client.js')(gulp)));

    /* Upload           */ gulp.task(...(require('./tasks/upload.js')(gulp)));
    /* Upload Manifest  */ gulp.task(...(require('./tasks/upload-manifest.js')(gulp)));
    /* Upload Assets    */ gulp.task(...(require('./tasks/upload-assets.js')(gulp)));
    /* Upload Styles    */ gulp.task(...(require('./tasks/upload-styles.js')(gulp)));

    /* Deploy           */ gulp.task(...(require('./tasks/deploy.js')(gulp)));

    /* Invalidate Cache */ gulp.task(...(require('./tasks/invalidate-cache.js')(gulp)));

    /* Watch            */ gulp.task(...(require('./tasks/watch.js')(gulp)));

    gulp.task('default', ['help']);
    return gulp;
}
