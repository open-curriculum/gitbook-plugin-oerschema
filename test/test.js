var tester = require("gitbook-tester");
var should = require("should");
var util = require('../utilities');

describe('Utilities', function() {
    it('should be blocked', function() {
        util.isBlocked('<div id="test">Some test text here.</div>').should.be.ok();
        util.isBlocked('Col 1 | Col 2 | Col 3').should.be.ok();
        util.isBlocked('* Item 1').should.be.ok();
    });

    it('should not be blocked', function() {
        util.isBlocked('<span id="test">Some test text here.</span>').should.not.be.ok();
        util.isBlocked('** Test').should.not.be.ok();
    });

    it('should be prefixed', function() {
        util.isResourcePrefixed('#Resource').should.be.ok();
        util.isResourcePrefixed('http://www.google.com/').should.be.ok();
    });

    it('should not be prefixed', function() {
        util.isResourcePrefixed('Resource').should.not.be.ok();
        util.isResourcePrefixed('//www.google.com/').should.not.be.ok();
    });
});

describe('Rendering Functions', function() {
    it('should parse link property from block', function () {
        var block = {
            name: 'oer_property',
            body: '',
            args: [],
            kwargs: {
                id: 'res1',
                type: 'URL',
                href: 'http://www.google.com/',
                name: 'uri'
            },
            blocks: []
        };

        util.printProperty(block).should.be.equal('<link property="oer:uri" resource="#res1" typeof="oer:URL" href="http://www.google.com/">');
    });

    it('should parse span property from block', function () {
        var block = {
            name: 'oer_property',
            body: 'This is test content',
            args: [],
            kwargs: {
                id: 'res1',
                type: 'Text',
                value: 'Test Property',
                name: 'name'
            },
            blocks: []
        };

        util.printProperty(block).should.be.equal('<span property="oer:name" resource="#res1" typeof="oer:Text" content="Test Property">This is test content</span>');
    });

    it('should parse meta property from block', function () {
        var block = {
            name: 'oer_property',
            body: '',
            args: [],
            kwargs: {
                id: 'res1',
                type: 'Text',
                value: 'Test Property',
                name: 'name'
            },
            blocks: []
        };

        util.printProperty(block).should.be.equal('<meta property="oer:name" resource="#res1" typeof="oer:Text" content="Test Property">');
    });

    it('should parse oer resource from block', function() {
        var block = {
            name: 'oer_resource',
            body: '',
            args: [],
            kwargs: {
                id: 'res1',
                type: 'Resource'
            },
            blocks: [
                {
                    name: 'oer_property',
                    body: 'Prop value',
                    args: [],
                    kwargs: {
                        name: 'name',
                        id: 'prop1',
                        type: 'Text'
                    }
                }
            ]
        };

        util.printResource(block.body, block).should.be.equal('<span resource="#res1" typeof="oer:Resource"><span property="oer:name" resource="#prop1" typeof="oer:Text">Prop value</span></span>');
    });

    it('should parse oer resource from block', function() {
        var block = {
            name: 'oer_resource',
            body: '',
            args: [],
            kwargs: {
                id: 'res1',
                type: 'Resource'
            },
            blocks: [
                {
                    name: 'oer_property',
                    body: 'Prop value',
                    args: [],
                    kwargs: {
                        name: 'name',
                        id: 'prop1',
                        type: 'Text',
                        for: '#res2'
                    }
                }
            ]
        };

        sanitizeAutoNames(util.printResource(block.body, block))
            .should.be.equal('<span resource="#res1" typeof="oer:Resource"><span resource="#oer" typeof="oer:Text">Prop value<oer about="#res2" rel="oer:name" href="#oer"></span></span>');
    });

    it('should render page', function() {
        var content = '<span resource="#res1" typeof="oer:Resource"><span resource="#oer" typeof="oer:Text">Prop value<oer about="#res2" rel="oer:name" href="#oer"></span></span>';
        util.printPage(content).should.be.equal('<div prefix="oer: http://oerschema.org/"><span resource="#res1" typeof="oer:Resource"><span resource="#oer" typeof="oer:Text">Prop value</span></span><link about="#res2" rel="oer:name" href="#oer"></div>');
    });
});

describe('GitBook', function() {
    this.timeout(20000);

    it('should have basic resource', function(testDone) {
        tester
            .builder()
            .withLocalPlugin(require('path').join(__dirname, '..'))
            .withContent('{% oer_resource type="Resource" %}' +
                '{% oer_property name="name" %}Prop value{% endoer_property %}' +
                '{% endoer_resource %}')
            .create()
            .then(function (result) {
                sanitizeAutoNames(result[0].content)
                    .should.equal('<div prefix="oer: http://oerschema.org/"><p><span typeof="oer:Resource"><span property="oer:name">Prop value</span></span></p>\n</div>');
                testDone();
            }, function (err) {
                should(err).not.be.ok();
                testDone();
            })
            .done()
        ;
    });

    it('should have reference to other resource', function(testDone) {
        tester
            .builder()
            .withLocalPlugin(require('path').join(__dirname, '..'))
            .withContent(
                '{% oer_resource id="res2", type="Resource" %}' +
                '{% oer_property name="name", for="res1", type="Text" %}Prop value 1{% endoer_property %}' +
                '{% endoer_resource %}' +
                '{% oer_resource id="res1", type="Resource" %}' +
                '{% oer_property name="name", for="res2", type="Text" %}Prop value 2{% endoer_property %}' +
                '{% endoer_resource %}')
            .create()
            .then(function(result) {
                sanitizeAutoNames(result[0].content).should.equal('<div prefix="oer: http://oerschema.org/"><p>' +
                    '<span resource="#res2" typeof="oer:Resource"><span typeof="oer:Text" resource="#oer">Prop value 1</span>' +
                    '</span><span resource="#res1" typeof="oer:Resource"><span typeof="oer:Text" resource="#oer">Prop value 2</span></span></p>\n' +
                    '<link about="#res1" rel="oer:name" href="#oer"><link about="#res2" rel="oer:name" href="#oer"></div>');
                testDone();
            }, function(err) {
                should(err).not.be.ok();
                testDone();
            })
            .done()
        ;
    });

    it('should have reference as a property', function(testDone) {
        tester
            .builder()
            .withLocalPlugin(require('path').join(__dirname, '..'))
            .withContent(
                '{% oer_resource id="res2", type="Resource" %}' +
                '{% oer_property name="name", for="res1", type="Text" %}Prop value 1{% endoer_property %}' +
                '{% endoer_resource %}' +
                '{% oer_resource id="res1", type="Resource", property="description", for="res2" %}' +
                '{% oer_property name="name", for="res2", type="Text" %}Prop value 2{% endoer_property %}' +
                '{% endoer_resource %}')
            .create()
            .then(function(result) {
                sanitizeAutoNames(result[0].content).should.equal('<div prefix="oer: http://oerschema.org/"><p>' +
                    '<span resource="#res2" typeof="oer:Resource"><span typeof="oer:Text" resource="#oer">Prop value 1</span>' +
                    '</span><span resource="#oer" typeof="oer:Resource"><span typeof="oer:Text" resource="#oer">Prop value 2</span></span></p>\n' +
                    '<link about="#res1" rel="oer:name" href="#oer"><link about="#res2" rel="oer:name" href="#oer"><link resource="#res1" about="#res2" rel="oer:description" href="#oer"></div>');
                testDone();
            }, function(err) {
                should(err).not.be.ok();
                testDone();
            })
            .done()
        ;
    });
});

function sanitizeAutoNames(content) {
    return content.replace(/(resource|href)\=\"\#oer[\d\.]+\"/g, '$1="#oer"');
}