module.exports = {
    blocks: {
        "oer": {
            blocks: ['property', 'endproperty', 'resource', 'endresource'],
            process: function(parent) {
                var blocks = parent.blocks;
                var body = parent.body;

                for (var i = 0; i < blocks.length; i++) {
                    var block = blocks[i];

                    if (!!block.name && /^(end)/.test(block.name)) {
                        body += block.body;
                        continue;
                    }

                    switch(block.name) {
                        case 'property':
                            body += printProperty(block);
                            break;
                        case 'resource':
                            body += printResource(block.body, block);
                            break;
                    }
                }

                return printResource(body, parent);
            }
        },
        "resource": {
            process: function(block) {
                return printResource(block.body, block);
            }
        },
        "property": {
            process: function(block) {
                return printProperty(block);
            }
        }
    },
    hooks: {
        "page": function(page) {
            page.content = '<div prefix="oer: http://oerschema.org/">' + page.content + '</div>';

            return page;
        }
    }
};

function isBlocked(str) {
    return /<\w+(?!span|meta|link|a|b|em)\/?>(\w.*?\w\s*\|)|(^\={2,}$)/gmi.test(str);
}

function isResourcePrefixed(r) {
    return /^(https?:\/\/)|#/gi.test(r);
}

function printResource(body, block) {
    var attr = block.kwargs;
    var tag = isBlocked(body) ? 'div' : 'span';
    var output = '<' + tag + ' ';

    if (attr.id) {
        output += 'resource="' + (
                isResourcePrefixed(attr.id) ? attr.id : '#' + attr.id
            ) + '" ';
    }

    if (attr.type) {
        output += 'typeof="oer:' + attr.type + '" '
    }

    if (attr.property) {
        output += 'property="oer:' + attr.property + '" ';
    }

    output += '>' + body + '</' + tag + '>';

    return output;
}

function printProperty(block) {
    var attr = block.kwargs;

    if (!attr.name) {
        throw new Error("Properties require a name");
    }

    if (attr.value) {
        return '<meta property="oer:' + attr.name + '" content="' + attr.value + '">' + block.body;
    }

    if (attr.for) {
        return '<link property="oer:' + attr.name + '" href="' +
        isResourcePrefixed(attr.value) ? attr.value : '#' + attr.value + '">' + block.body;
    }

    var tag = isBlocked(block.body) ? 'div' : 'span';

    return '<' + tag + ' property="oer:' + attr.name + '">' + block.body + '</' + tag + '>';
}