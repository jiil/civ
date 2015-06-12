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
                case 'img':
                    if(elm.attribs.alt){
                        obj = elm.attribs.alt.replace(/^20x/,"").replace(/5$/,"").replace(/ (Civ5)/,"")
                        obj = obj.replace(/^./,obj[0].toUpperCase());
                    }else{
                        obj = null;
                    }
                    break;
                case 'span' :
                    if(elm.attribs.style === 'display:none;'){
                        obj = null;
                    }else{
                        obj = alignChidren(elm.children);
                    }
                    break;
                case 'noscript':
                    obj = null;
                    break;
                case 'li':
                    var sons = alignChidren(elm.children);
                    if( _.every(sons, function(son){return (typeof son === 'string');})){
                        obj = sons.join(" ");
                    }else{
                        obj.name = elm.name;
                        obj.children = sons;
                    }
                    break;
                case 'tr':
                    var sons = alignChidren(elm.children);
                    obj[_.first(sons)] = _.rest(sons);
                    break;
                case 'table':
                    var sons = alignChidren(elm.children);
                    obj = _.reduce(sons, function(o,s){return _.extend(o,s)}, {});
                    break;
                case 'a' : 
                case 'br':
                case 'b':
                case 'i':
                case 'p':
                case 'ul':
                case 'div':
                case 'th':
                case 'td':
                    obj = alignChidren(elm.children);
                    break;
                default:
                    obj.name = elm.name;
                    obj.children = alignChidren(elm.children);
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

function alignChidren(children){
    return _.uniq(_.compact(_.flatten(_.map(children, function(child){return elm2obj(child);}))));
}
