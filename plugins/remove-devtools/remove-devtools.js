'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function({types: t}) {
    return {
        visitor: {
            ImportDeclaration: function (nodePath, state) {
                //node.source.value contains the import declaration
                var text = nodePath.node.source.value;

                if (isRegexExpressionTruthy(text, /library\/devtools/g)) {
                    for (const specifier of nodePath.node.specifiers) {
                        for (const path of nodePath.scope.bindings[specifier.local.name].referencePaths) {
                            if (path.parent.type === 'CallExpression') {
                                if (path.parentPath.parentPath && path.parentPath.parentPath.node.type === 'LogicalExpression') {
                                    //Replace with the right side operator
                                    path.parentPath.parentPath.replaceWith(path.parentPath.parentPath.node.right)
                                } else if(path.parentPath.parentPath.node.type === 'SpreadProperty') {
                                    //Replace spread with empty object
                                    path.parentPath.replaceWith(t.ObjectExpression([]));
                                } else {
                                    //Replace with null
                                    path.parentPath.replaceWith(t.NullLiteral());
                                }
                                // console.log();
                            } else if (path.parent.type === 'VariableDeclarator') {
                                //Replace with function that returns null
                                const ret = t.ReturnStatement(t.NullLiteral());
                                const block = t.BlockStatement([ret]);
                                const func = t.FunctionExpression(
                                    null,
                                    [],
                                    block
                                );
                                path.replaceWith(func)
                            }
                        }
                    }
                    // console.log();
                    nodePath.remove();
                }
            }
        }
    }
};

//check whether the text (import declaration) is matches the given regex
function isRegexExpressionTruthy(text, regex) {
    return (regex instanceof RegExp) ? !!text.match(regex) : false;
}
