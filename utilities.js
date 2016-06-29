/**
 * Created by acb222 on 6/28/16.
 */
module.exports = {
    isBlocked: function (str) {
        return /(<(?!(\/?(span|meta|link|a|b|em|strong|i|u|oer))).*?\/?>)|(\w.*?\w\s*\|)|(^\={2,}$)|(^\*\s?[^\*]+$)/gmi.test(str) === true;
    },
    isResourcePrefixed: function (r) {
        return /^(https?:\/\/)|#/i.test(r) === true;
    },
    sanitizePrefix: function(str) {
        return this.isResourcePrefixed(str) ? str : '#' + str;
    },
    sanitizeName: function(name) {
        return /^[a-z]+\:/i.test(name) === true ? name : 'oer:' + name;
    },
    generateResourceName: function() {
        return '#oer' + ((new Date()).getTime() * Math.random());
    },
    printResource: function (body, block) {
        try {
            var attr = block.kwargs;
            var tag = this.isBlocked(body) ? 'div' : 'span';
            var output = '<' + tag;
            var oAttr = {};

            if (attr.id) {
                oAttr.resource = this.sanitizePrefix(attr.id);
            }

            if (attr.type) {
                oAttr.typeof = this.sanitizeName(attr.type);
            }

            if (attr.property) {
                if (attr.for) {
                    var res = oAttr.resource;
                    oAttr.resource = this.generateResourceName();
                    body += '<oer resource="' + res + '" about="' + this.sanitizePrefix(attr.for) + '" rel="' + this.sanitizeName(attr.property) + '" href="' + oAttr.resource + '">';
                } else {
                    oAttr.property = this.sanitizeName(attr.property);
                }
            }

            for(var n in oAttr) {
                output += ' ' + n + '="' + oAttr[n] + '"';
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
                        case 'oer_property':
                            output += this.printProperty(b);
                            break;
                        case 'oer_resource':
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

        if (!attr.name) {
            throw new Error("Properties require a name");
        }

        oAttr.property = this.sanitizeName(attr.name);

        if (attr.id) {
            oAttr.resource = this.sanitizePrefix(attr.id);
        }

        if (attr.type) {
            oAttr.typeof = this.sanitizeName(attr.type);
        }

        if (attr.value) {
            if (!block.body) { // If no body, then use meta
                tag = 'meta';
            }
            oAttr.content = attr.value;
        } else if (attr.href) {
            tag = 'link';
            oAttr.href = this.sanitizePrefix(attr.href);
        }

        if (attr.for) {
            delete oAttr.property;
            oAttr.resource = this.generateResourceName();
            block.body += '<oer about="' + this.sanitizePrefix(attr.for)
                + '" rel="oer:' + attr.name + '" href="' + oAttr.resource + '">';
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