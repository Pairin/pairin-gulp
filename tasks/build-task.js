const Task = require('./base-task.js');

class BuildTask extends Task {
    constructor() {
        super('build', 'Build the Application')
    }

    get args() {
        return {
            'environment':'production|staging|development'
        }
    }

    get dependencies() {
        return [
            'copy-public',
            'build-client',
            'build-server'
        ]
    }
}

module.exports = (gulp) => {
    return (new BuildTask()).toArray();
}
