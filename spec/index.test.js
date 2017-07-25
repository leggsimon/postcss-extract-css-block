const postcss = require('postcss');
const css = require('css');
const plugin = require('../');
const path = require('path');
const fs = require('fs-extra');

const targetFile = path.join(__dirname, 'public/main.css');
const cssFixture = fs.readFileSync(`${__dirname}/fixtures/main.css`, 'utf8');


beforeEach(() => {
    const publicDirExists = fs.existsSync(`${__dirname}/public`);
    expect(publicDirExists).toBe(false);
});

afterEach(() => {
    fs.removeSync(`${__dirname}/public`);
});

describe('output file', () => {
    it('writes multiple files', () => {
        return postcss([plugin()]).process(cssFixture, { to: targetFile })
            .then(() => {
                const publicDirExists = fs.existsSync(`${__dirname}/public`);
                expect(publicDirExists).toBe(true);

                const filesCreated = fs.readdirSync(`${__dirname}/public`);
                const expectedFiles = ['main.css', 'external.css', 'parent.css', 'child.css'];
                expectedFiles.forEach(file => {
                    expect(filesCreated).toContain(file);
                });
            });
    });

    it('will write output to a different filename', () => {
        return postcss([plugin()]).process(cssFixture, { to: path.join(__dirname, 'public/different.css') })
            .then(() => {
                const publicDirExists = fs.existsSync(`${__dirname}/public`);
                expect(publicDirExists).toBe(true);

                const filesCreated = fs.readdirSync(`${__dirname}/public`);
                const expectedFiles = ['different.css', 'external.css', 'parent.css', 'child.css'];
                expectedFiles.forEach(file => {
                    expect(filesCreated).toContain(file);
                });
            });
    });

    it('will write output to main.css if target has no filename', () => {
        return postcss([plugin()]).process(cssFixture, { to: path.join(__dirname, 'public') })
            .then(() => {
                const publicDirExists = fs.existsSync(`${__dirname}/public`);
                expect(publicDirExists).toBe(true);

                const filesCreated = fs.readdirSync(`${__dirname}/public`);
                const expectedFiles = ['main.css', 'external.css', 'parent.css', 'child.css'];
                expectedFiles.forEach(file => {
                    expect(filesCreated).toContain(file);
                });
            });
    });

    it('will write into a nested directory', () => {
        return postcss([plugin()]).process(cssFixture, { to: path.join(__dirname, 'public/nested/main.css') })
            .then(() => {
                const nestedDirExists = fs.existsSync(`${__dirname}/public/nested`);
                expect(nestedDirExists).toBe(true);

                const filesCreated = fs.readdirSync(`${__dirname}/public/nested`);
                const expectedFiles = ['main.css', 'external.css', 'parent.css', 'child.css'];
                expectedFiles.forEach(file => {
                    expect(filesCreated).toContain(file);
                });
            });
    });
});

describe('output styles', () => {
    it('removes block pragmas', () => {
        return postcss([ plugin() ]).process(cssFixture, { to: targetFile })
            .then(() => {
                ['main.css', 'external.css', 'parent.css', 'child.css'].forEach(file => {
                    const result = fs.readFileSync(`${__dirname}/public/${file}`, 'utf8');

                    expect(/\*! start:[\w]+\.css \*/.test(result)).toBe(false);
                    expect(/\*! end:[\w]+\.css \*/.test(result)).toBe(false);
                });
            });
    });

    it('extracts the contents of the block pragmas', () => {
        return postcss([ plugin() ]).process(cssFixture, { to: targetFile })
            .then(() => {
                const main = fs.readFileSync(`${__dirname}/public/main.css`, 'utf8');
                const external = fs.readFileSync(`${__dirname}/public/external.css`, 'utf8');
                const parent = fs.readFileSync(`${__dirname}/public/parent.css`, 'utf8');
                const child = fs.readFileSync(`${__dirname}/public/child.css`, 'utf8');

                expect(/^\.outside-media-query \{/.test(main)).toBe(true);
                expect(/^\.external \{/.test(external)).toBe(true);
                expect(/^\.parent \{/.test(parent)).toBe(true);
                expect(/^\.child \{/.test(child)).toBe(true);
            });
    });
});
