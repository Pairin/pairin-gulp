const gutil = require('gulp-util');
const notifier = require('node-notifier');

module.exports = function(err) {
    notifier.notify({
        'title': 'Pairin Build Error',
        'message': err.message
    });
    gutil.log(gutil.colors.red(err.toString()));
    this.emit('end');
}
