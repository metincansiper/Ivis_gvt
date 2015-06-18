var addNode = function (name, x_, y_, w, h, color, shape) {
  var id_ = IDGenerator.generate();

  css = {};
  css["content"] = name;
  css["background-color"] = color;
  css["shape"] = shape;

  cy.add({
    group: "nodes",
    data: {id: id_, width: w, height: h},
    position: {x: x_, y: y_},
    css: css
  });

  cy.layout({
    name: "preset"
  });
}

var deleteNode = function (theNode) {
  var id = theNode.data("id");
  for (var _id in Globals.elements.nodes) {
    if (Globals.elements.nodes[_id].parent == id) {
      deleteNode(Globals.elements.nodes[_id]);
    }
  }
  theNode.remove();
  Globals.elements.nodes[id] = null;
  for (var _id in Globals.elements.edges) {
    if (Globals.elements.nodes[_id].source == id || Globals.elements.nodes[_id].target == id) {
      Globals.elements.edges[_id] = null;
    }
  }
}

var showAllLayoutSelections = function () {
  $("#select-springy").show();
  $("#select-cose").show();
  $("#select-arbor").show();
  $("#select-cola").show();
}

var hideAllLayoutPropertyTables = function () {
  $("#springy-properties-table").hide();
  $("#cose-properties-table").hide();
  $("#arbor-properties-table").hide();
  $("#cola-properties-table").hide();
}

var saveLayoutProperties = function () {
  if (currentLayout == "cose") {
    currentProperties.nodeRepulsion = $("#node-repulsion-cose").val();
    currentProperties.nodeOverlap = $("#node-overlap-cose").val();
    currentProperties.idealEdgeLength = $("#ideal-edge-length-cose").val();
  }
  else if (currentLayout == "springy") {
    currentProperties.repulsion = $("#repulsion-springy").val();
    currentProperties.stiffness = $("#stiffness-springy").val();
  }
  else if (currentLayout == "arbor") {
    currentProperties.gravity = $("#arbor-gravity").prop("checked");
    currentProperties.infinite = $("#arbor-infinate").prop("checked");
  }
  else if (currentLayout == "cola") {
    currentProperties.avoidOverlap = $("#avoid-overlap-cola").prop("checked");
    currentProperties.edgeLength = $("#edge-length-cola").val();
  }
}

window.currentLayout = "cose";

window.coseProperties = {
  name: 'cose',
  // Called on `layoutready`
  ready: function () {
  },
  // Called on `layoutstop`
  stop: function () {
  },
  // Whether to animate while running the layout
  animate: true,
  // Number of iterations between consecutive screen positions update (0 -> only updated on the end)
  refresh: 4,
  // Whether to fit the network view after when done
  fit: true,
  // Padding on fit
  padding: 30,
  // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  boundingBox: undefined,
  // Whether to randomize node positions on the beginning
  randomize: true,
  // Whether to use the JS console to print debug messages
  debug: false,
  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: 400000,
  // Node repulsion (overlapping) multiplier
  nodeOverlap: 10,
  // Ideal edge (non nested) length
  idealEdgeLength: 10,
  // Divisor to compute edge forces
  edgeElasticity: 100,
  // Nesting factor (multiplier) to compute ideal edge length for nested edges
  nestingFactor: 5,
  // Gravity force (constant)
  gravity: 250,
  // Maximum number of iterations to perform
  numIter: 100,
  // Initial temperature (maximum node displacement)
  initialTemp: 200,
  // Cooling factor (how the temperature is reduced between consecutive iterations
  coolingFactor: 0.95,
  // Lower temperature threshold (below this point the layout will end)
  minTemp: 1.0
};

window.arborProperties = {
  name: 'arbor',
  animate: true, // whether to show the layout as it's running
  maxSimulationTime: 4000, // max length in ms to run the layout
  fit: true, // on every layout reposition of nodes, fit the viewport
  padding: 30, // padding around the simulation
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  ungrabifyWhileSimulating: false, // so you can't drag nodes during layout

  // callbacks on layout events
  ready: undefined, // callback on layoutready 
  stop: undefined, // callback on layoutstop

  // forces used by arbor (use arbor default on undefined)
  repulsion: undefined,
  stiffness: undefined,
  friction: undefined,
  gravity: true,
  fps: undefined,
  precision: undefined,
  // static numbers or functions that dynamically return what these
  // values should be for each element
  // e.g. nodeMass: function(n){ return n.data('weight') }
  nodeMass: undefined,
  edgeLength: undefined,
  stepSize: 0.1, // smoothing of arbor bounding box

  // function that returns true if the system is stable to indicate
  // that the layout can be stopped
  stableEnergy: function (energy) {
    var e = energy;
    return (e.max <= 0.5) || (e.mean <= 0.3);
  },
  // infinite layout options
  infinite: false // overrides all other options for a forces-all-the-time mode
};

window.springyProperties = {
  name: 'springy',
  animate: true, // whether to show the layout as it's running
  maxSimulationTime: 4000, // max length in ms to run the layout
  ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
  fit: true, // whether to fit the viewport to the graph
  padding: 30, // padding on fit
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  random: false, // whether to use random initial positions
  infinite: false, // overrides all other options for a forces-all-the-time mode
  ready: undefined, // callback on layoutready
  stop: undefined, // callback on layoutstop

  // springy forces
  stiffness: 400,
  repulsion: 400,
  damping: 0.5
};

window.colaProperties = {
  name: 'cola',
  animate: true, // whether to show the layout as it's running
  refresh: 1, // number of ticks per frame; higher is faster but more jerky
  maxSimulationTime: 4000, // max length in ms to run the layout
  ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
  fit: true, // on every layout reposition of nodes, fit the viewport
  padding: 30, // padding around the simulation
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }

  // layout event callbacks
  ready: function () {
  }, // on layoutready
  stop: function () {
  }, // on layoutstop

  // positioning options
  randomize: false, // use random node positions at beginning of layout
  avoidOverlap: true, // if true, prevents overlap of node bounding boxes
  handleDisconnected: true, // if true, avoids disconnected components from overlapping
  nodeSpacing: function (node) {
    return 10;
  }, // extra spacing around nodes
  flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
  alignment: undefined, // relative alignment constraints on nodes, e.g. function( node ){ return { x: 0, y: 1 } }

  // different methods of specifying edge length
  // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
  edgeLength: 45, // sets edge length directly in simulation
  edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
  edgeJaccardLength: undefined, // jaccard edge length in simulation

  // iterations of cola algorithm; uses default values on undefined
  unconstrIter: undefined, // unconstrained initial layout iterations
  userConstIter: undefined, // initial layout iterations with user-specified constraints
  allConstIter: undefined, // initial layout iterations with all constraints including non-overlap

  // infinite layout options
  infinite: false // overrides all other options for a forces-all-the-time mode
};

window.currentProperties = coseProperties;

$(document).ready(function () {
  window.cy = cytoscape({
    container: document.getElementById('sbgn-network-container'),
    elements: {
      nodes: [],
      edges: []
    }
  });

  cy.on('tap', 'node', function (event) {
    this.toggleClass('selected');
    if (this.hasClass('selected')) {
      this.style('border-width', '2');
      this.style('border-color', 'black');
    }
    else {
      this.style('border-width', '0');
    }
  });
  
  cy.on('tap', 'edge', function (event) {
    this.toggleClass('selected');
    if (this.hasClass('selected')) {
      this.style('line-color', '#660033');
      this.style('target-arrow-color', '#660033');
      this.style('source-arrow-color', '#660033');
    }
    else {
      var originalColor = this._private.data['original-color'];
      this.style('line-color', originalColor);
      this.style('target-arrow-color', originalColor);
      this.style('source-arrow-color', originalColor);
    }
  });

  $("#layout-properties-dialog").hide();
  $("#add-node-dialog").hide();

  $("#select-cose").hide();

  $("#load-file").click(function () {
    $("#file-input").trigger('click');
  });

  $("#delete-node").click(function () {
    var childNodes = cy.$('node.selected');
    for (var i = 0; i < childNodes.length; i++) {
      var theNode = childNodes[i];
      theNode.remove();
      cy.layout({
        name: 'preset'
      });
    }
  });
  
  $("#delete-edge").click(function () {
    var childEdges = cy.$('edge.selected');
    for (var i = 0; i < childEdges.length; i++) {
      var theEdge = childEdges[i];
      theEdge.remove();
      cy.layout({
        name: 'preset'
      });
    }
  });

  $("#add-edge").click(function () {
    var childNodes = cy.$('node.selected');
    if (childNodes.length != 2) {
      alert("exactly 2 nodes should be selected to create an edge!!!");
      return;
    }
    var source = childNodes[0].id();
    var target = childNodes[1].id();

    var id = IDGenerator.generate();
    var css = {};
//    css["target-arrow-shape"] = "triangle";
    cy.add(
            {
              group: "edges",
              data: {
                id: id,
                source: source,
                target: target
              },
              css: css
            }
    );

    childNodes.toggleClass('selected');
    childNodes.style('border-width', '0');
  });

  $("#add-node").click(function () {
    $("#add-node-dialog").dialog({
      modal: true,
      draggable: false,
      resizable: false,
      position: ['center', 'top'],
      show: 'blind',
      hide: 'blind',
      width: 400,
      dialogClass: 'ui-dialog-osx',
      buttons: {
        "add": function () {
          var name = $("#new-node-name").val();
          var w = $("#new-node-width").val();
          var h = $("#new-node-height").val();
          var x = $("#new-node-x").val();
          var y = $("#new-node-x").val();
          var color = $("#new-node-color").val();
          var shape = $("#new-node-shape").val();

          if (w == "") {
            w = null;
          }
          else {
            w = Number(w);
          }

          if (h == "") {
            h = null;
          }
          else {
            h = Number(h);
          }

          if (x == "") {
            x = null;
          }
          else {
            x = Number(x);
          }

          if (y == "") {
            y = null;
          }
          else {
            y = Number(y);
          }
          addNode(name, x, y, w, h, color, shape);
          console.log();
          $(this).dialog("close");
        }
      }
    });
  });

  $("#create-compound").click(function () {
    var childNodes = cy.$('node.selected');

    for (var i = 0; i < childNodes.length; i++) {
      var theNode = childNodes[i];
      if (theNode.data("parent") != null) {
        alert("nodes should have no parent");
        return;
      }
    }

    var pid = IDGenerator.generate();

    cy.add({
      group: "nodes",
      data: {
        id: pid
      }
    });

    for (var i = 0; i < childNodes.length; i++) {
      var theChild = childNodes[i];
      theChild._private.data.parent = pid;
    }

    Globals.refreshElements();
  });

  $("#layout-properties").click(function () {
    if (currentLayout == "cose") {
      $("#node-repulsion-cose").val(currentProperties.nodeRepulsion);
      $("#node-overlap-cose").val(currentProperties.nodeOverlap);
      $("#ideal-edge-length-cose").val(currentProperties.idealEdgeLength);
      hideAllLayoutPropertyTables();
      $("#cose-properties-table").show();
    }
    else if (currentLayout == "springy") {
      $("#repulsion-springy").val(currentProperties.repulsion);
      $("#stiffness-springy").val(currentProperties.stiffness);
      hideAllLayoutPropertyTables();
      $("#springy-properties-table").show();
    }
    else if (currentLayout == "arbor") {
      $("#arbor-gravity").prop('checked', currentProperties.gravity);
      $("#arbor-infinate").prop('checked', currentProperties.infinite);
      hideAllLayoutPropertyTables();
      $("#arbor-properties-table").show();
    }
    else if (currentLayout == "cola") {
      $("#avoid-overlap-cola").prop('checked', currentProperties.avoidOverlap);
      $("#edge-length-cola").val(currentProperties.edgeLength);
      hideAllLayoutPropertyTables();
      $("#cola-properties-table").show();
    }
    $("#layout-properties-dialog").dialog({
      modal: true,
      draggable: false,
      resizable: false,
      position: ['center', 'top'],
      show: 'blind',
      hide: 'blind',
      width: 400,
      dialogClass: 'ui-dialog-osx',
      buttons: {
//        "default": function () {
//          $(this).dialog("close");
//        },
        "save": function () {
          saveLayoutProperties();
          $(this).dialog("close");
        }
      }
    });
  });

  $("#save").click(function () {
    var result = JSONToGraphML.convert();

    var blob = new Blob([result], {
      type: "text/plain;charset=utf-8;",
    });
    var filename = "" + new Date().getTime() + ".xml";
    saveAs(blob, filename);
  });

  $("#select-cose").click(function () {
    showAllLayoutSelections();
    $("#select-layout").text("CoSE Layout");
    currentLayout = "cose";
    currentProperties = coseProperties;
    $(this).hide();
  });
  
  $("#select-springy").click(function () {
    showAllLayoutSelections();
    $("#select-layout").text("Springy Layout");
    currentLayout = "springy";
    currentProperties = springyProperties;
    $(this).hide();
  });

  $("#select-cola").click(function () {
    showAllLayoutSelections();
    $("#select-layout").text("Cola Layout");
    currentLayout = "cola";
    currentProperties = colaProperties;
    $(this).hide();
  });

  $("#select-arbor").click(function () {
    showAllLayoutSelections();
    $("#select-layout").text("Arbor Layout");
    currentLayout = "arbor";
    currentProperties = arborProperties;
    $(this).hide();
  });

  $("#perform-layout").click(function () {
    cy.nodes().removeData("ports");
    cy.edges().removeData("portsource");
    cy.edges().removeData("porttarget");

    cy.nodes().data("ports", []);
    cy.edges().data("portsource", []);
    cy.edges().data("porttarget", []);

//    currentProperties.eles = null;

    var options = {};
    
    for(var prop in currentProperties){
      options[prop] = currentProperties[prop];
    }

    cy.layout(options);
//    var layout = cy.makeLayout(options);
//
//    layout.run();
  });

  $("body").on("change", "#file-input", function (e) {
    var filePath = $("#file-input").val();
    if (filePath == "") {
      return;
    }
    var fileInput = document.getElementById('file-input');
    var file = fileInput.files[0];

    var reader = new FileReader();

    reader.onload = function (e) {
      GraphMLToJSon.nodeKeys = {};
      GraphMLToJSon.edgeKeys = {};
      GraphMLToJSon.graphKeys = {};

      Globals.elements = {};
      Globals.elements.nodes = {};
      Globals.elements.edges = {};

      GraphMLToJSon(this.result);
      GraphMLToJSon.fillKeys();
      GraphMLToJSon.toJSON();

      Globals.createElements();

      Globals.elements.nodes = {};
      Globals.elements.edges = {};
    }

    reader.readAsText(file);

    $("#file-input").val("");
  });
});
