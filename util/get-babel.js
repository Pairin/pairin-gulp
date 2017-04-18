const fs = require('fs');
const path = require('path');
const deepmerge = require('deepmerge');

module.exports =  () => {
    let userBabelRc = {};
    try {
        userBabelRc = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), '.babelrc'), "utf8"));
    } catch (e) {}

    let packageBabelRc = {};
    try {
        packageBabelRc = JSON.parse(fs.readFileSync(path.resolve(__dirname, '.babelrc'), "utf8"));
    } catch (e) {}

    return deepmerge(packageBabelRc, userBabelRc);
}
