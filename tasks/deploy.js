const Task = require('./base-task.js');


class Deploy extends Task {
    constructor(gulp) {
        super('deploy', 'Deploy the application')
        this.runSequence = require('run-sequence').use(gulp);
    }

    task(cb) {
        return this.runSequence(
            'clean-server',
            'copy-public',
            'build',
            'bundle',
            'upload',
            'invalidate-cache',
            cb
        );
    }
}

module.exports = (gulp) => {
    return (new Deploy(gulp)).toArray();
}
