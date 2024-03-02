(function() {

  function createEl(type, id, className) {
    var e = document.createElement(type);
    if (id)
      e.id = id;
    if (className)
      e.className = className;
    return e;
  }

  function appendEl(e, type, id, className) {
    var newEl = createEl(type, id, className);
    e.appendChild(newEl);
    return newEl;
  }

  function createStylesheet() {
    var style = document.createElement("style");
    style.appendChild(document.createTextNode(""));
    document.head.appendChild(style);
    return style.sheet;
  }

  function addCSSRule(sheet, selector, rules, index) {
    if("insertRule" in sheet) {
      sheet.insertRule(selector + "{" + rules + "}", index);
    }
    else if("addRule" in sheet) {
      sheet.addRule(selector, rules, index);
    }
  }


  // Setup functions

  function setupGridDebuggerStyles() {
    var sheet = createStylesheet();
    addCSSRule(sheet, "#grid-container" , "position: fixed; top: 0; left: 0; height: 100%; width: 100%;");
    addCSSRule(sheet, "#grid-debugger .container, #grid-debugger .container-fluid, #grid-debugger .row", "height: 100%; opacity: .5;");
    addCSSRule(sheet, "#grid-debugger .row > div", "opacity: .7; height: 100%; border: 1px solid yellow; background-image:linear-gradient(to bottom, rgba(240, 255, 40, 1) 0%, rgba(240, 255, 40, 1) 100%), linear-gradient(to bottom, rgba(240, 40, 40, 1) 0%, rgba(240, 40, 40, 1) 100%); background-clip: content-box, padding-box;");
    addCSSRule(sheet, "#grid-debugger .btn-group", "position: fixed; top: 0; z-index: 99999;");
  }

  function setupGrid() {
    var grid = createEl('div', 'grid-debugger'),
        gridContainer = appendEl(grid, 'div', 'grid-container'),
        container = appendEl(gridContainer, 'div', null, 'container'),
        row = appendEl(container, 'div', null, 'row');

    for (var i = 0; i < 12; i++) {
      appendEl(row, 'div', null, 'col-xs-1');
    }
    document.body.insertBefore(grid, document.body.childNodes[0]);
  }

  function setupButtons() {
    var grid = document.getElementById('grid-debugger'),
        btnGroup = appendEl(grid, 'div', null, 'btn-group'),
        toggleBtn = appendEl(btnGroup, 'button', null, 'btn btn-default glyphicon glyphicon-th'),
        fluidBtn = appendEl(btnGroup, 'button', null, 'btn btn-default glyphicon glyphicon-resize-full'),
        fixedBtn = appendEl(btnGroup, 'button', null, 'btn btn-default glyphicon glyphicon-resize-small');
        frontBtn = appendEl(btnGroup, 'button', null, 'btn btn-default glyphicon glyphicon-chevron-up');
        backBtn = appendEl(btnGroup, 'button', null, 'btn btn-default glyphicon glyphicon-chevron-down');
    toggleBtn.onclick = toggleShow;
    fluidBtn.onclick = changeToFluidGrid;
    fixedBtn.onclick = changeToFixedGrid;
    frontBtn.onclick = bringToFront;
    backBtn.onclick = bringToBack;
  }

  function _changeTo(from, to) {
    var grid = document.getElementById('grid-debugger'),
        container = grid.getElementsByClassName(from)[0];
    if (container)
      container.className = to;
  }


  // Public functions

  function toggleShow() {
    var grid = document.getElementById('grid-container');
    if(grid.style.display != "none")
      grid.style.display = "none";
    else
      grid.style.display = "block";
  }

  function changeToFixedGrid() {
    _changeTo('container-fluid', 'container');
  }

  function changeToFluidGrid() {
    _changeTo('container', 'container-fluid');
  }

  function bringToFront() {
    document.getElementById('grid-container').style.zIndex = 100;
  }

  function bringToBack() {
    document.getElementById('grid-container').style.zIndex = -100;
  }

  window.gridDebugger = {
    init: function () {
      setupGridDebuggerStyles();
      setupGrid();
      setupButtons();
      toggleShow();
    },
    toggleShow: toggleShow,
    changeToFluidGrid: changeToFluidGrid,
    changeToFixedGrid: changeToFixedGrid
  };

})();
