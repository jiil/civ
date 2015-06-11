var htmlparser = require("htmlparser2");
var DomUtils = require('domutils');
var _ = require('underscore');
var fs = require('fs');
var handler = new htmlparser.DomHandler(function (error, dom) {
    if (error){ console.log(error) }
    else{ 
        var tabber = DomUtils.getElements({tag:'div', class:'tabber'},dom,true)[0];
        //var tabber = DomUtils.getElements({tag:'a', class:'mw-redirect'},dom,true)[0];
        //console.log(tabber);
        console.log(JSON.stringify(elm2obj(tabber)));
    }
}, {normalizeWhitespace:true});
var parser = new htmlparser.Parser(handler);
fs.readFile(__dirname + '/Cathedral_(Civ5)', function(err, result){
parser.write(result);
parser.done();
});

function elm2obj(elm){
    var obj = {};
    switch (elm.type) {
        case 'tag':
            if (elm.name) {
                obj.name = elm.name;
            }
            if(elm.attribs.class){obj.name = obj.name + "_" + elm.attribs.class;}
            var attr = _.omit(elm.attribs, 'class', 'colspan', 'style', 'alt', 'data-image-key', 'data-image-name', 'width', 'height');
            if (_.keys(attr).length > 0) {
                obj.attribs = attr;
            }
            obj.children = [];
            _.each(elm.children, function(child) {
                var cobj = elm2obj(child);
                if(cobj){
                    if(cobj.text && obj.children.length > 0 && obj.children[(obj.children.length -1)].text){
                        obj.children[(obj.children.length -1)].text = obj.children[(obj.children.length -1)].text + " " + cobj.text;
                    }else{
                        obj.children.push(cobj)
                    }
                }
            });
            if(!obj.attribs){
                switch(obj.children.length){
                    case 0 :
                        obj = null;
                        break;
                    case 1:
                        obj = obj.children[0];
                        break;
                    default:
                        break;
                }
            }
            break;
        case 'text':
            var text = elm.data.trim();
            if (text.length > 0) {
                obj.text = text;
            }else{
                obj = null;
            }
            break;
    }
    //console.log(obj);
    return obj;
}
