(function() {
  var lastParent = null;
  function addIcon(icon, svg) {
    var node, parent, x, y;

    if (typeof svg !== 'string') {
      return;
    }

    // Add node
    console.log('Iconfont: importing SVG:', svg);
    node = figma.createNodeFromSvg(svg);
    if (!node) {
      return;
    }

    // Change name
    node.name = icon.slug;

    // Move it to currently selected item
    if (!figma.currentPage) {
      return;
    }

    parent = null;
    if (figma.currentPage.selection.length) {
      parent = figma.currentPage.selection[0];
      switch (parent.type) {
        case 'GROUP':
        case 'PAGE':
          break;
        case 'FRAME':
          if (parent.parent.type === 'PAGE') {
            // Frame with parent group should be parent for icon, unless its another icon
            if (parent.name.indexOf('-') !== -1 || parent.name.indexOf(':') !== -1) {
              parent = parent.parent;
            }
            break;
          }
          parent = parent.parent;
          break;

        default:
          parent = parent.parent;
      }
    }

    // Move icon to middle of selected group
    console.log('Iconfont debug: moving icon to middle of selected group');
    if (parent && parent.type !== 'PAGE' && parent !== node.parent) {
      if (!lastParent || lastParent.node !== parent) {
        lastParent = {
          node: parent,
          offset: 0
        };
      }

      // Move to top left corner
      switch (parent.type) {
        case 'FRAME':
          x = 0;
          y = 0;
          break;

        default:
          x = parent.x;
          y = parent.y;
      }
      node.x = x;
      node.y = y;

      if (parent.width > node.width) {
        x = Math.floor(parent.width / 2 - node.width);
        x += lastParent.offset;
        node.x += x;
        lastParent.offset += node.width;
      }

      // Change parent node
      console.log('Iconfont debug: changing parent node');
      parent.insertChild(parent.children.length, node);
    } else {
      // Move icon to middle of viewport
      console.log('Iconfont debug: moving to middle of viewport');
      node.x = Math.round(figma.viewport.center.x - node.width);
      node.y = Math.round(figma.viewport.center.y - node.height);
    }

    // Select node
    console.log('Iconfont debug: changing selection');
    figma.currentPage.selection = [node];
  }

  figma.showUI(__html__, {
    width: 500,
    height: 600
  });

  figma.ui.onmessage = msg => {
    console.log("got this from the UI", msg);
    switch (msg.event) {
      case 'insert-svg':
        addIcon(msg.icon, msg.svg);
    }
  };
})();
