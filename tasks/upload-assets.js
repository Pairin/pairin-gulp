const Task = require('./base-task.js');
const through2 = require('through2');
const path = require('path');
const rename = require('gulp-rename');
const print = require('gulp-debug');
const AWS_SDK = require('aws-sdk');

const s3 = new AWS_SDK.S3();

class UploadAssets extends Task {
    constructor(gulp) {
        super('upload-assets', 'Upload the application assets')
        this.gulp = gulp;
    }

    task() {
        return this.gulp.src(path.resolve(process.cwd(), './dist/**/*'))
                .pipe(rename({
                    dirname: `${process.env.NODE_ENV}/${process.env.EnvironmentName}/`
                }))
                .pipe(print({title: 'Upload Assets'}))
                .pipe(through2.obj(function(file, enc, cb) {
                    s3.putObject({
                        Bucket: 'assets.pairin.com',
                        Key: path.relative(path.resolve(process.cwd(), './dist'), file.path),
                        Body: file.contents,
                        ACL: 'public-read'
                    }, cb)
                }))
    }
}

module.exports = (gulp) => {
    return (new UploadAssets(gulp)).toArray();
}
