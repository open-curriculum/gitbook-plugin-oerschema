# OERSchema GitBook Plugin
[![Build Status](https://travis-ci.org/open-curriculum/gitbook-plugin-oerschema.svg?branch=master)](https://travis-ci.org/open-curriculum/gitbook-plugin-oerschema)

A GitBook Plugin to apply OER Schema metadata to GitBooks content

## Installation
Simply add to your book.json file in GitBooks.

```JSON
...
    {
        plugins: ["oerschema"]
    }
...

```

## Usage

There are two elements provided by this plugin, `Resources` and `Properties`. A `Resource` is a subject described by one or more `Properties`. 

### Resource

Resources are defined using the `{% oer_resource %}` tag and has the following attributes:

| Attribute | Definition |
|---|---|
| id  | The ID of the resource. This ID can be used to reference the resource within the page or from other pages. |
| type | The resource type. [See oerschema.org](http://oerschema.org/docs/schema.html) |
| property | A resource can be a property value of parent resource. This is the name of the property on the parent resource for which the resource is the value of. |
| for | The name of the parent resource for which this resource is a property value of. The property attribute must be used. If this resource is nested within the parent resource for which this resource is a value, the `for` attribute is unnecessary. |

### Property

Properties are defined using the `{% oer_property %}` tag and has the following attributes:

| Attribute  | Definition |
|---|---|
| name  | **Required.** The property name as it exists in the property list of the resource for which the property is for. [See oerschema.org](http://oerschema.org/docs/schema.html) |
| id | Properties can be used as a resource. This is the resource name. |
| type | A property can be a resource, so this attribute is the same as in `Resource` |
| for | The name of the parent resource for which this property is for. If this property is nested within the parent resource for which it is a value, the `for` attribute is unnecessary. |
| value | The explicit value of the property. If not provided, it will be up to the schema interpreter to parse the appropriate value from the element's body |
| href | A property can act as a link between two resources. Where `for` is the attribute connecting this property to its parent resource, `href` connects a child resource as the value of this property. |

### Examples

```Markdown

{% oer_resource id="#main",  %}
    {% oer_property %}
{% endoer_resource %}

```