var util = require(require('path').join(__dirname, 'utilities.js'));

module.exports = {
    blocks: {
        "oer": {
            blocks: ['property', 'endproperty', 'resource', 'endresource'],
            process: function(block) {
                return util.printResource(block.body, block);
            }
        },
       "resource": {
            blocks: ['property', 'endproperty'],
            process: function(block) {
                try {
                    return util.printResource(block.body, block);
                }
                catch (e) {
                    return JSON.stringify(block);
                }
            }
        },
        "property": {
            process: function(block) {
                return util.printProperty(block);
            }
        }
    },
    hooks: {
        "page": function(page) {
            page.content = util.printPage(page.content);

            return page;
        }
    }
};