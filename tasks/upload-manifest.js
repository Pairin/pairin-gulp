const Task = require('./base-task.js');
const through2 = require('through2');
const path = require('path');
const rename = require('gulp-rename');
const print = require('gulp-debug');
const AWS_SDK = require('aws-sdk');

const s3 = new AWS_SDK.S3();

class UploadManifest extends Task {
    constructor(gulp) {
        super('upload-manifest', 'Upload the application manifest')
        this.gulp = gulp;
    }

    task() {
        return this.gulp.src(path.resolve(process.cwd(), './sass-manifest.json'))
                    .pipe(rename(`pairin-${process.env.EnvironmentName}-manifest.${process.env.NODE_ENV}.json`))
                    .pipe(print({title: 'Upload Manifest'}))
                    .pipe(through2.obj(function(file, enc, cb) {
                        s3.putObject({
                            Bucket: 'pairin-deployments',
                            Key: path.relative(process.cwd(), file.path),
                            Body: file.contents,
                            ACL: 'bucket-owner-full-control'
                        }, cb)
                    }));
    }
}

module.exports = (gulp) => {
    return (new UploadManifest(gulp)).toArray();
}
