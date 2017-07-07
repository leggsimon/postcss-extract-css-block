const postcss = require('postcss');
const fs = require('fs');

const DELIMITER = /^!\s?(start|end):([\w_-]+\.css)\s?$/;

module.exports = postcss.plugin('postcss-extract-css-block', function (opts) {
	opts = opts || {};

	// Work with options here

	return function (root, result) {

        const stack = [];
        const blocks = {};

        stack.push('main.css')
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

            blocks[context].nodes.push(rule)
        });



        Object.keys(blocks).forEach(filename => {
            console.log('\x1b[36m', blocks[filename], '\x1b[0m');
            const css = blocks[filename].toString();
            fs.writeFile(`public/${filename}`, css, 'utf8',(err) => {
                if (err) throw err;
                console.log(`${css} has been saved to ${filename}!`);
            })
        })
        result.root = blocks[stack[0]];

        // for each of our ASTs, turn them into css text and write the file


        // result.messages.push('blah')
        // const newRoot = postcss.root();
        //

        // return [result]
		// Transform CSS AST here

	};
});
