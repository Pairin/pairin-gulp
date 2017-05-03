const Task = require('./base-task.js');
const through2 = require('through2');
const path = require('path');
const rename = require('gulp-rename');
const print = require('gulp-debug');
const AWS_SDK = require('aws-sdk');

const cloudfront = new AWS_SDK.CloudFront();

class InvalidateCache extends Task {
    constructor() {
        super('invalidate-cache', 'Invalidate the cloudfront cache')
    }

    task() {
        return new Promise(this.createInvalidation)
    }

    createInvalidation(resolve, reject) {
        cloudfront.createInvalidation({
            DistributionId: process.env.distributionId,
            InvalidationBatch: {
                CallerReference: Date.now().toString(),
                Paths: {
                    Quantity: 1,
                    Items: [
                        `/${process.env.NODE_ENV}/${process.env.EnvironmentName}/*`
                    ]
                }
            }
        }, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        })
    }
}

module.exports = (gulp) => {
    return (new InvalidateCache()).toArray();
}
