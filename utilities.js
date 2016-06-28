/**
 * Created by acb222 on 6/28/16.
 */
module.exports = {
    isBlocked: function (str) {
        return /(<(?!(\/?(span|meta|link|a|b|em|strong|i|u|oer))).*?\/?>)|(\w.*?\w\s*\|)|(^\={2,}$)|(^\*\s?[^\*]+$)/gmi.test(str) === true;
    },
    isResourcePrefixed: function (r) {
        return /^(https?:\/\/)|#/gi.test(r) === true;
    },
    printResource: function (body, block) {
        try {
            var attr = block.kwargs;
            var tag = this.isBlocked(body) ? 'div' : 'span';
            var output = '<' + tag;

            if (attr.id) {
                output += ' resource="' + (
                        this.isResourcePrefixed(attr.id) ? attr.id : '#' + attr.id
                    ) + '"';
            }

            if (attr.type) {
                output += ' typeof="oer:' + attr.type + '"'
            }

            if (attr.property) {
                output += ' property="oer:' + attr.property + '"';
            }

            output += '>';

            if (block.blocks && block.blocks.length) {
                var blocks = block.blocks;
                for (var i = 0; i < blocks.length; i++) {
                    var b = blocks[i];

                    if (!!b.name && /^(end)/.test(b.name)) {
                        output += b.body;
                        continue;
                    }

                    switch (b.name) {
                        case 'property':
                            output += this.printProperty(b);
                            break;
                        case 'resource':
                            output += this.printResource(b.body, b);
                            break;
                    }
                }
            }

            output += body + '</' + tag + '>';
        } catch (e) {
            output = e.message;
        }

        return output;
    },
    printProperty: function (block) {
        var attr = block.kwargs,
            tag,
            oAttr = {},
            output;

        try {
            if (!attr.name) {
                throw new Error("Properties require a name");
            }

            oAttr.property = 'oer:' + attr.name;

            if (attr.id) {
                oAttr.resource = this.isResourcePrefixed(attr.id) ? attr.id : '#' + attr.id;
            }

            if (attr.type) {
                oAttr.typeof = 'oer:' + attr.type;
            }

            if (attr.value) {
                if (!block.body) { // If no body, then use meta
                    tag = 'meta';
                }
                oAttr.content = attr.value;
            } else if (attr.href) {
                tag = 'link';
                oAttr.href = this.isResourcePrefixed(attr.href) ? attr.href : '#' + attr.href;
            }

            if (attr.for) {
                delete oAttr.property;
                oAttr.resource = '#oer' + ((new Date()).getTime() * Math.random());
                block.body += '<oer about="' +
                    (this.isResourcePrefixed(attr.for) ? attr.for : '#' + attr.for)
                    + '" rel="oer:' + attr.name + '" href="' + oAttr.resource + '">'

            }

            tag = tag || (block.body && this.isBlocked(block.body) ? 'div' : 'span');

            output = '<' + tag;

            for (var n in oAttr) {
                if (oAttr.hasOwnProperty(n)) {
                    output += ' ' + n + '="' + oAttr[n] + '"';
                }
            }

            output += '>' + block.body;

            if (tag == 'div' || tag == 'span') {
                output += '</' + tag + '>';
            }
        } catch (e) {
            output = e.message;
        }

        return output;
    },
    printPage: function (content) {
        try {
            var matches = content.match(/<oer .*?href\=\"[^\"]+\".*?>/gim);
            content = content.replace(/<oer.*?>/gim, "");

            if (!!matches && !!matches.length) {
                for (var i = 0; i < matches.length; i++) {
                    content += matches[i].replace(/<oer\s/gim, '<link ');
                }
            }

            return '<div prefix="oer: http://oerschema.org/">' + content + '</div>';
        } catch (e) {
            return e.message;
        }
    }
};