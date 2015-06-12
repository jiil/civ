var htmlparser = require("htmlparser2");
var DomUtils = require('domutils');
var _ = require('underscore');
var fs = require('fs');
var handler = new htmlparser.DomHandler(function(error, dom) {
    if (error) {
        console.log(error)
    } else {
        var tabber = DomUtils.getElements({
            tag: 'table',
            class: 'wikitable'
        }, dom, true)[0];
        //var tabber = DomUtils.getElements({tag:'a', class:'mw-redirect'},dom,true)[0];
        //console.log(tabber);
        console.log(JSON.stringify(elm2obj(tabber)));
    }
}, {
    normalizeWhitespace: true
});
var parser = new htmlparser.Parser(handler);
fs.readFile(__dirname + '/Cathedral_(Civ5)', function(err, result) {
    parser.write(result);
    parser.done();
});

function elm2obj(elm) {
    var obj = {};
    switch (elm.type) {
        case 'tag':
            switch(elm.name){
                case 'a' : 
                    obj = _.map(elm.children, function(child){return elm2obj(child);});
                    break;
                case 'img':
                    if(elm.attribs){
                        obj = elm.attribs.alt.replace(/^20x/,"").replace(/5$/,"").replace(/ (Civ5)/,"");
                    }else{
                        obj = null;
                    }
                    break;
                case 'span' :
                    if(elm.attribs.style === 'display:none;'){
                        obj = null;
                    }else{
                        obj = _.compact(_.flatten(_.map(elm.children, function(child){return elm2obj(child);})));
                    }
                    break;
                case 'noscript':
                    obj = null;
                    break;
                case 'li':
                    var sons = _.compact(_.flatten(_.map(elm.children, function(child){return elm2obj(child);})));
                    if( _.every(sons, function(son){return (typeof son === 'string');})){
                        obj = sons.join(" ");
                    }else{
                        obj.name = elm.name;
                        obj.children = sons;
                    }
                    break;
                case 'tr':
                    var sons = _.compact(_.flatten(_.map(elm.children, function(child){return elm2obj(child);})));
                    obj[_.first(sons)] = _.rest(sons);
                    break;
                case 'table':
                    var sons = _.compact(_.flatten(_.map(elm.children, function(child){return elm2obj(child);})));
                    obj = _.reduce(sons, function(o,s){return _.extend(o,s)}, {});
                    break;
                case 'br':
                case 'b':
                case 'i':
                case 'p':
                case 'ul':
                case 'div':
                case 'th':
                case 'td':
                    obj = _.compact(_.flatten(_.map(elm.children, function(child){return elm2obj(child);})));
                    break;
                default:
                    obj.name = elm.name;
                    obj.children = _.compact(_.flatten(_.map(elm.children, function(child){return elm2obj(child);})));
                    break;
            }
            break;
        case 'text':
            obj = elm.data.trim();
            break;
    }
    //console.log(obj);
    return obj;
}
