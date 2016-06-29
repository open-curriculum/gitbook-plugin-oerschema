var util = require(require('path').join(__dirname, 'utilities.js'));

module.exports = {
    blocks: {
       "oer_resource": {
            blocks: ['oer_property', 'endoer_property', 'oer_resource', 'endoer_resource'],
            process: function(block) {
                return util.printResource(block.body, block);
            }
        },
        "oer_property": {
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