GraphMLToJSon.nodeKeys = {};
GraphMLToJSon.edgeKeys = {};
GraphMLToJSon.graphKeys = {};

function GraphMLToJSon(text) {
  GraphMLToJSon.text = text;
  GraphMLToJSon.xmlDoc = textToXmlObject(text);
}
;

function loadXMLDoc(filename) {
  if (window.XMLHttpRequest) {
    xhttp = new XMLHttpRequest();
  }
  else {
    xhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xhttp.open("GET", filename, false);
  xhttp.send();
  return xhttp.responseXML;
}
;

function textToXmlObject(text) {
  if (window.ActiveXObject) {
    var doc = new ActiveXObject('Microsoft.XMLDOM');
    doc.async = 'false';
    doc.loadXML(text);
  } else {
    var parser = new DOMParser();
    var doc = parser.parseFromString(text, 'text/xml');
  }
  return doc;
}
;

GraphMLToJSon.fillKeys = function () {
  var x = GraphMLToJSon.xmlDoc.getElementsByTagName('key');
  for (i = 0; i < x.length; i++)
  {
    var type = x[i].getAttribute('attr.type');
    var id = x[i].getAttribute('id');
    var name = x[i].getAttribute('attr.name');
    var _for = x[i].getAttribute('for');

    var obj = {
      type: type,
      id: id,
      name: name,
      _for: _for
    };

    if (_for == "all") {
      GraphMLToJSon.nodeKeys[id] = obj;
      GraphMLToJSon.edgeKeys[id] = obj;
      GraphMLToJSon.graphKeys[id] = obj;
    }
    else if (_for == "node") {
      GraphMLToJSon.nodeKeys[id] = obj;
    }
    else if (_for == "edge") {
      GraphMLToJSon.edgeKeys[id] = obj;
    }
    else if (_for == "graph") {
      GraphMLToJSon.graphKeys[id] = obj;
    }
  }
};

GraphMLToJSon.processEdge = function (theEdge) {
  var id = $(theEdge).attr('id');

  var source = $(theEdge).attr('source');
  var target = $(theEdge).attr('target');
  var edgeData = $(theEdge).children('data');
  var cyData = {};
  var cyCSS = {};

  cyData.id = id;
  cyData.source = source;
  cyData.target = target;
//  cyData.group = "edges";

  $(edgeData).each(function () {
    var keyId = $(this).attr("key");
    var val = $(this).text();
    var key = GraphMLToJSon.edgeKeys[keyId];
    if (key == null) {
      console.log("" + keyId + " is not a valid key for an edge");
      return;
    }
    var type = key['type'];
    var name = key['name'];

    if (type == "int") {
      val = Number(val);
    }

    if (name == "style") {
      cyCSS['line-style'] = val;
    }
    else if (name == "arrow") {
      cyCSS['target-arrow-shape'] = val;
    }
    else if (name == "color") {
      if(val.indexOf(" ") > -1){
        cyCSS['line-color'] = 'rgb(' + val.replace(/ /g, ',') + ')';
        cyCSS['target-arrow-color'] = 'rgb(' + val.replace(/ /g, ',') + ')';
        cyCSS['source-arrow-color'] = 'rgb(' + val.replace(/ /g, ',') + ')';
        cyData['original-color'] = 'rgb(' + val.replace(/ /g, ',') + ')';
      }
      else{
        cyCSS['line-color'] = val; 
        cyCSS['target-arrow-color'] = val; 
        cyCSS['source-arrow-color'] = val; 
        cyData['original-color'] = val; 
      }
    }
  });

//  Globals.elements.edges.push({data: cyData, css: cyCSS});
  Globals.elements.edges[id] = {data: cyData, css: cyCSS};
}

GraphMLToJSon.processNode = function (theNode, pid) {
  var id = $(theNode).attr('id');

  var nodeData = $(theNode).children('data');
  var cyData = {};
  var cyCSS = {};
  var cyPos = {};

  cyData.id = id;
//  cyData.group = "nodes";

  if (pid != null) {
    cyData.parent = pid;
  }

  $(nodeData).each(function () {
    var keyId = $(this).attr("key");
    var val = $(this).text();
    var key = GraphMLToJSon.nodeKeys[keyId];
    var type = key['type'];
    var name = key['name'];

    if (key == null) {
      console.log("" + keyId + " is not a valid key for a node");
      return;
    }

    if (type == "int") {
      val = Number(val);
    }

    if (name == "x") {
      cyPos.x = val;
    }
    else if (name == "y") {
      cyPos.y = val;
    }
    else if (name == "height") {
      cyData.height = val;
    }
    else if (name == "width") {
      cyData.width = val;
    }
    else if (name == "shape") {
      cyCSS.shape = val.toLowerCase();
    }
    else if (name == "color") {
      if(val.indexOf(" ") > -1)
        cyCSS['background-color'] = 'rgb(' + val.replace(/ /g, ',') + ')';
      else
        cyCSS['background-color'] = val;
    }
    else if (name == "text") {
      cyCSS.content = val;
    }
  });

//  Globals.elements.nodes.push({data: cyData, css: cyCSS, position: cyPos});
  Globals.elements.nodes[id] = {data: cyData, css: cyCSS, position: cyPos};

  var child = $(theNode).children('graph');
  if (child.length > 0) {
    child = child[0];
    
    var childNodes = $(child).children("node");

    for (var i = 0; i < childNodes.length; i++) {
      var theNode = $(childNodes)[i];
      GraphMLToJSon.processNode(theNode, id);
    }
  }
}

GraphMLToJSon.toJSON = function () {
  var xmlObject = GraphMLToJSon.xmlDoc;
  var root = $(xmlObject).find("graph")[0];
  var childNodes = $(root).children("node");

  for (var i = 0; i < childNodes.length; i++) {
    var theNode = $(childNodes)[i];
    GraphMLToJSon.processNode(theNode, null);
  }

  var edges = $(root).children("edge");
  for (var i = 0; i < edges.length; i++) {
    var theEdge = $(edges)[i];
    GraphMLToJSon.processEdge(theEdge);
  }
//  console.log(JSON.stringify(Globals.elements));
};

