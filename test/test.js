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

        util.printProperty(block).should.be.equal('<div property="oer:name" resource="#res1" typeof="oer:Text" content="Test Property"><p>This is test content</p></div>');
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

        util.printResource(block.body, block).should.be.equal('<div resource="#res1" typeof="oer:Resource"><div property="oer:name" resource="#prop1" typeof="oer:Text"><p>Prop value</p></div></div>');
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
            .should.be.equal('<div resource="#res1" typeof="oer:Resource"><div resource="#oer" typeof="oer:Text"><p>Prop value</p><oer about="#res2" rel="oer:name" href="#oer"></div></div>');
    });

    it('should parse oer resource with property from block', function() {
        var block = {
            body: '',
            args: [],
            kwargs: {},
            blocks: [
                {
                    name: 'oer_resource',
                    body: '',
                    args: [],
                    kwargs: {
                        name: 'name',
                        id: '#res3',
                        type: 'Resource'
                    },
                    blocks: [
                        {
                            name: 'oer_property',
                            body: 'Prop value 1',
                            args: [],
                            kwargs: {
                                name: 'name',
                                for: '#res4',
                                type: 'Text'
                            }
                        }
                    ]
                },
                {
                    name: 'oer_resource',
                    body: '',
                    args: [],
                    kwargs: {
                        id: '#res4',
                        for: '#res3',
                        property: 'description',
                        type: 'Resource'
                    },
                    blocks: [
                        {
                            name: 'oer_property',
                            body: 'Prop value 2',
                            args: [],
                            kwargs: {
                                name: 'name',
                                type: 'Text',
                                for: 'res3'
                            }
                        }
                    ]
                }
            ]
        };

        sanitizeAutoNames(util.printResource(block.body, block)).should.be.equal('<div><div resource="#res3" typeof="oer:Resource">' +
            '<div typeof="oer:Text" resource="#oer"><p>Prop value 1</p><oer about="#res4" rel="oer:name" href="#oer"></div>' +
            '</div><div resource="#oer" typeof="oer:Resource"><div typeof="oer:Text" resource="#oer"><p>Prop value 2</p><oer about="#res3" rel="oer:name" href="#oer"></div>' +
            '<oer resource="#res4" about="#res3" rel="oer:description" href="#oer"></div></div>');
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
                '{% oer_property name="name" %}' + "\n" +
                '## Prop value' + "\n" +
                '{% endoer_property %}' +
                '{% endoer_resource %}')
            .create()
            .then(function (result) {
                sanitizeAutoNames(result[0].content.replace(/\n/g, ''))
                    .should.equal('<div prefix="oer: http://oerschema.org/"><div typeof="oer:Resource"><div property="oer:name"><h2 id="prop-value">Prop value</h2></div></div></div>');
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
                sanitizeAutoNames(result[0].content.replace(/\n/g, '')).should.equal('<div prefix="oer: http://oerschema.org/">' +
                    '<div resource="#res2" typeof="oer:Resource"><div typeof="oer:Text" resource="#oer"><p>Prop value 1</p></div>' +
                    '</div><div resource="#res1" typeof="oer:Resource"><div typeof="oer:Text" resource="#oer"><p>Prop value 2</p></div></div>' +
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
                '{% oer_resource id="res3", type="Resource" %}' +
                '{% oer_property name="name", for="res4", type="Text" %}Prop value 3{% endoer_property %}' +
                '{% endoer_resource %}' +
                '{% oer_resource id="res4", type="Resource", property="description", for="res3" %}' +
                '{% oer_property name="name", for="res3", type="Text" %}Prop value 4{% endoer_property %}' +
                '{% endoer_resource %}')
            .create()
            .then(function(result) {
                sanitizeAutoNames(result[0].content.replace(/\n/g, '')).should.equal('<div prefix="oer: http://oerschema.org/">' +
                    '<div resource="#res3" typeof="oer:Resource"><div typeof="oer:Text" resource="#oer"><p>Prop value 3</p></div>' +
                    '</div><div resource="#oer" typeof="oer:Resource"><div typeof="oer:Text" resource="#oer"><p>Prop value 4</p></div></div>' +
                    '<link about="#res4" rel="oer:name" href="#oer"><link about="#res3" rel="oer:name" href="#oer"><link resource="#res4" about="#res3" rel="oer:description" href="#oer"></div>');
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