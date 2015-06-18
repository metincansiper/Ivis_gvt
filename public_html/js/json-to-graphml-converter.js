function JSONToGraphML() {
}

var text;

JSONToGraphML.convert = function(){
  initText();
  addKeys();
  handleRootGraph();
  finilizeText();
  console.log(text);
  return text;
}

var initText = function () {
  text = '<graphml xmlns="http://graphml.graphdrawing.org/xmlns">\n';
}

var finilizeText = function () {
  text += '</graphml>';
}

var addKeys = function () {
  text += '\t<key id="x" for="node" attr.name="x" attr.type="int"/>\n';
  text += '\t<key id="y" for="node" attr.name="y" attr.type="int"/>\n';
  text += '\t<key id="height" for="node" attr.name="height" attr.type="int"/>\n';
  text += '\t<key id="width" for="node" attr.name="width" attr.type="int"/>\n';
  text += '\t<key id="shape" for="node" attr.name="shape" attr.type="string"/>\n';
  text += '\t<key id="style" for="edge" attr.name="style" attr.type="string"/>\n';
  text += '\t<key id="arrow" for="edge" attr.name="arrow" attr.type="string"/>\n';
  text += '\t<key id="color" for="all" attr.name="color" attr.type="string"/>\n';
  text += '\t<key id="text" for="all" attr.name="text" attr.type="string"/>\n';
}

var handleRootGraph = function () {
  text += '\t<graph id="" edgedefault="undirected">\n';
  var orphans = cy.nodes().orphans();
  for (var i = 0; i < orphans.length; i++) {
    handleNode(orphans[i], 2);
  }
  var edges = cy.edges();
  for (var i = 0; i < edges.length; i++) {
    handleEdge(edges[i]);
  }
  text += '\t</graph>\n';
}

var handleNode = function (node, tabLevel) {
  var nodeTabs = "";
  for (var i = 0; i < tabLevel; i++) {
    nodeTabs += "\t";
  }

  text += nodeTabs;
  text += '<node id="';
  text += node.data("id");
  text += '">\n';

  var internalTabs = nodeTabs + "\t";
  text += internalTabs;
  text += '<data key="x">' + node.position("x") + '</data>\n';

  text += internalTabs;
  text += '<data key="y">' + node.position("y") + '</data>\n';

  text += internalTabs;
  text += '<data key="height">' + node.data("height") + '</data>\n';

  text += internalTabs;
  text += '<data key="width">' + node.data("width") + '</data>\n';

  text += internalTabs;
  text += '<data key="color">' + node.css("background-color") + '</data>\n';

  text += internalTabs;
  text += '<data key="text">' + node.css("content") + '</data>\n';

  text += internalTabs;
  text += '<data key="color">' + node.css("background-color") + '</data>\n';

  text += internalTabs;
  text += '<data key="shape">' + node.css("shape") + '</data>\n';

  var children = node.children();
  if (children != null && children.length > 0) {
    text += internalTabs;
    text += '<graph id="' + node.data("id") + ':' + '"' + 
            + 'edgedefault="undirected">\n';
    
    for(var i = 0; i < children.length; i++){
      handleNode(children[i], tabLevel + 2);
    }
    
    text += internalTabs;
    text += '</graph>\n';
  }

  text += nodeTabs;
  text += '</node>\n';
}

var handleEdge = function(){
  var edgeTabs = "\t\t";
  var edges = cy.edges();
  var dataTabs = "\t\t\t";
  
  for(var i = 0; i < edges.length; i++){
    var edge = edges[i];
    text += edgeTabs;
    
    text += '<edge id="' + edge.data("id") + '" source="' 
            + edge.data("source") + '" target="'
            + edge.data("target") + '">\n';
    
    text += dataTabs;
    text += '<data key="style">' + edge.css("line-style") + '</data>\n';
    
    text += dataTabs;
    text += '<data key="arrow">' + edge.css("target-arrow-shape") + '</data>\n';
    
    text += dataTabs;
    text += '<data key="color">' + edge.css("line-color") + '</data>\n';
    
    text += edgeTabs;
    text += '</edge>\n'
  }
}