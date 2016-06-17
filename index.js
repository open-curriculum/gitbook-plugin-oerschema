module.exports = {
    website: {
        'body:start': function() {
            return '<div prefix="oer: http://oerschema.org/">';
        },
        'body:end': function() {
            return '</div>';
        }
    },
    blocks: {
        oer: {
            process: function(block) {
                var book = block.book;
                var schema = book.oemSchema;
                var args = block.kwargs;
                var obj = {};

                if (args.type) {
                    obj.type = 'oer:' + args.type;
                    delete args.type;
                }

                if (args.id) {
                    obj.resource = args.id.search(/#|^https?:\/\//gi) >= 0 ? args.id : '#' + args.id;
                    delete args.id;
                }

                if (args.for) {
                    obj.href = args.for.search(/#|^https?:\/\//gi) >= 0 ? args.for : '#' + args.for;
                    delete args.for;
                }

                if (args.property) {
                    obj.property = 'oer:' + args.property;
                }
                else {
                    for (var prop in args) {
                        var p = {
                                'property': prop
                            },
                            v = args[prop]
                            ;

                        if (v.search(/#|^https?:\/\//gi) >= 0) {
                            p.href = v;
                        }
                        else {
                            p.value = v;
                        }

                        schema.push(p);
                    }
                }

                schema.push(obj);

                if (obj.resource) {
                    var tag = block.content.test(/<\w+.*?\/?>/gmi) ? 'div' : 'span';
                    return '<' + tag + ' resource="' + obj.resource + '">' + block.content + '</' + tag + '>';
                }

                return block.content;
            }
        }
    },
    hooks: {
        init: function () {
            this.book.oerSchema = [];
        },
        'page:before': function(page) {
            var schema = this.book.oerSchema,
                output;

            schema.forEach(function(item, i, arr) {
                output = '<';

                if (!item.type && !item.href && (item.property || item.value)) {
                    output += 'meta name="' + item.property + '" content="' + (item.resource || item.value) + '" ';
                }
                else {
                    output += 'link ';

                    if (item.type) {
                        output += 'typeof="' + item.type + '" ';
                    }

                    if (item.property) {
                        output += 'property="' + item.property + '" ';
                    }

                    if (item.href) {
                        output += ' href="' + item.href + '" ';
                    }
                    else if (item.resource) {
                        output += ' href="' + item.resource + '" ';
                    }
                }

                output += '>';
                page.content += output;
            });

        }
    }
};