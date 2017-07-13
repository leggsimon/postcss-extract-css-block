const postcss = require('postcss');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const DELIMITER = /^!\s?(start|end):([\w_-]+\.css)\s?$/;

module.exports = postcss.plugin('postcss-extract-css-block', function () {
    return function (root, result) {

        const targetDir = path.dirname(result.opts.to);
        const stack = [];
        const blocks = {};

        stack.push('main.css');
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
            const target = path.join(targetDir, filename);
            fs.writeFileSync(target, css, 'utf8', (err) => {
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
