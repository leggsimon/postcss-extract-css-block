const postcss = require('postcss');
const fs = require('fs-extra');
const path = require('path');
const mkdirp = require('mkdirp');

const DELIMITER = /^!\s?(start|end):([\w_-]+\.css)\s?$/;

module.exports = postcss.plugin('postcss-extract-css-block', function () {
    return function (root, result) {

        const target = result.opts.to;
        const treatTargetAsDir = path.extname(target);
        const targetDir = treatTargetAsDir ? path.dirname(target) : target;
        const targetFile = treatTargetAsDir ?
            path.basename(target) :
            'main.css';
        const stack = [];
        const blocks = {};

        stack.push(targetFile);
        let context = stack[stack.length - 1];

        root.nodes.forEach(rule => {

            // if it's a comment
            if (rule.type === 'comment' && DELIMITER.test(rule.text)) {
                const matches = rule.text.match(DELIMITER);
                const type = matches[1];
                const name = matches[2];

                if (type === 'start') {
                    stack.push(name);
                } else {
                    stack.pop();
                }
                // assign the current context
                context = stack[stack.length - 1];

                // deal with being in a context and having no closing comment
                return;
            }

            // if it's a rule
            // find our current context
            // add rule to that context
            if (!blocks[context]) {
                blocks[context] = postcss.root();
            }

            blocks[context].nodes.push(rule);
        });

        mkdirp(targetDir, (err) => {
            if (err) console.error(err);
        });

        Object.keys(blocks).forEach(filename => {
            const css = blocks[filename].toString().trim();
            const outputFile = path.join(targetDir, filename);
            fs.writeFileSync(outputFile, css, 'utf8', (err) => {
                if (err) throw err;
            });
        });
        result.root = blocks[stack[0]];

        // for each of our ASTs, turn them into css text and write the file


        // result.messages.push('blah')
        // const newRoot = postcss.root();
        //

        // return [result]
        // Transform CSS AST here

    };
});
