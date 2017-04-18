const BuildClient = require('./build-client.js');

module.exports = (gulp) => {
    const FontelloClient = BuildClient(gulp);

    FontelloClient[0] = 'fontello-client';
    FontelloClient[1] = 'Build client with fontello';
    FontelloClient[2] = ['fontello'];
    FontelloClient[4] = {};

    return FontelloClient;
}
