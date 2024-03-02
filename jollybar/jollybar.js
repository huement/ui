/**!
 *     _____ ______ ____   ____  ___ ___ ______ _______ _______
 *   _|     |      |    |_|    ||   |   |   __ \   _   |   __  \
 *  |       |   O  |      |      \     /|   __ <       |       <
 *  |_______|______|______|______||___| |______/___|___|___|___|
 *  O F F I C I A L  D E B U G G E R  O F  H U E M E N T . C O M
 *
 * @ Author: Derek Scott
 * @ Create Time: 2021-04-17 15:04:41
 * @ Description: CSS Debugger. Provides stylesheet switcher, vertical rhythm guidelines,
 *                as well as visual indicators for line-height, font-size, breakpoints etc.
 */

//──── STYLE SHEET LOADING SETUP ──────────────────────────────────────────────────────────
const frameworksURLBase = "https://dohliam.github.io/dropin-minimal-css/min/";
const frameworks =
  "a11yana,axist,bahunya,bare,base,basic,bonsai,bullframe,bulma,caiuss,caramel,cardinal,centurion,chota,cirrus,clmaterial,codify,comet,concise,concrete,cutestrap,flat-ui,fluidity,furtive,generic,github-markdown,gutenberg,hack,hello,hiq,holiday,html-starterkit,hyp,kathamo,koochak,kraken,kube,latex,lemon,lit,lotus,markdown,marx,material,materialize,mercury,milligram,min,mini,minimal,minimal-stylesheet,mobi,motherplate,mu,mui,mvp,neat,new,no-class,normalize,oh-my-css,ok,pandoc-scholar,paper,papier,pavilion,picnic,pico,preface,primer,propeller,pure,roble,sakura,sanitize,scooter,semantic-ui,shoelace,siimple,simple,skeleton,skeleton-framework,skeleton-plus,snack,spcss,spectre,style,stylize,tachyons,tacit,tent,thao,tui,vanilla,vital,water,wing,writ,yamb,yorha,ads-gazette,ads-medium,ads-notebook,ads-tufte,attri-bright-light-green,attri-midnight-green,attri-dark-forest-green,attri-dark-fairy-pink,attri-light-fairy-pink,awsm-default,awsm-black,awsm-bigstone,awsm-gondola,awsm-mischka,awsm-pastelpink,awsm-pearllusta,awsm-tasman,awsm-white,boot-cerulean,boot-cosmo,boot-cyborg,boot-darkly,boot-flatly,boot-journal,boot-lumen,boot-paper,boot-readable,boot-sandstone,boot-slate,boot-spacelab,boot-superhero,boot-yeti,md-air,md-modest,md-retro,md-splendor,w3c-chocolate,w3c-midnight,w3c-modernist,w3c-oldstyle,w3c-steely,w3c-swiss,w3c-traditional,w3c-ultramarine";
const frameworks_array = frameworks.split(",");

// Eventually populated w/ a JSON array of file names.
// List.json is generated via '$ node tasks/RUN.js --cssbar'
let hui_cssFiles = "";

// Helper Function for sheet names
let capitalize = function (s) {
  let u = s.replace(/^(.)/, function (_, l) {
    return l.toUpperCase();
  });
  return u;
};

//──── STYLE SHEETS VIA JSON LIST FILE ───────────────────────────────────────────────────

function loadJSON(callback, fileURL) {
  console.log("Loading JSON File: " + fileURL);

  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open("GET", fileURL, true); // Replace 'my_data' with the path to your file
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}

function huementINIT() {
  loadJSON(function (response) {
    // Parse JSON string into object
    hui_cssFiles = JSON.parse(response);

    // Sort files by last modified
    hui_cssFiles.sort(function (a, b) {
      return new Date(b.modified) - new Date(a.modified);
    });

    add_inline_switcher();
  }, "../jollybar/list.json");
}

//──── SELECT INPUT STYLE SHEET CHANGER ──────────────────────────────────────────────────

// Appends or adds a new <link> element, with the provided URL as its content
// So long as a unique ID is passed per function can toggle unlimited CSS sheets
let loadCSSFile = function (URL, StyleSheetID) {
  let cssSheet = document.getElementById(StyleSheetID);
  let action = "";
  let stamp = Math.round(new Date().getTime() / 1000);

  // If first run, create <link href='..' type='text/css' />
  // otherwise switch href to new CSS file
  if (!cssSheet) {
    let head = document.getElementsByTagName("head")[0];
    let element = document.createElement("link");
    element.setAttribute("rel", "stylesheet");
    element.setAttribute("type", "text/css");
    element.setAttribute("href", URL + "?stamp=" + stamp);
    element.setAttribute("id", StyleSheetID);
    head.appendChild(element);
    action = "Added ";
  } else {
    cssSheet.setAttribute("href", URL + "?stamp=" + stamp);
    action = "Loaded ";
  }

  setTimeout(debugType, 2000);

  console.log(action + URL);
};

// This function is called via the Inline <select> element's onchange event
// Its purpose is to format the <select> <option>'s value into a URL
// which it then passes onto the actual stylesheet loading function
// eslint-disable-next-line no-unused-vars
let switch_css = function (css) {
  let css_link = "";
  let switcher = document.getElementById("switcher_dropdown");
  let pL = "";
  let sbC = "";
  let debugBtn = document.getElementById("debugBtn");
  if (switcher != null) {
    if (frameworks_array.indexOf(css) > -1) {
      css_link = frameworksURLBase + css + ".min.css";

      sbC = "rgba(200, 200, 200, 0.8)";
      pL = "24px";
      document.body.style.paddingLeft = pL;

      // Hide Debug Button
      debugBtn.style.display = "none";
    } else {
      css_link = "../jollybar/" + css;

      sbC = "rgba(20, 20, 20, 0.6)";
      pL = "20px";
      debugBtn.style.display = "block";
    }

    switcher.style.color = sbC;
    console.log(css_link);
    loadCSSFile(css_link, "mojo_css");
  }
};

// Creates the CSS stylesheet loading <select> input element
let add_inline_switcher = function () {
  let switcherWrap = document.getElementById("switcher_wrapper");
  let switcher = document.getElementById("switcher_dropdown");
  let dropdown = "";
  let f = "";
  let fname = "";
  let noext = "";
  let i = 0;
  let framework_name = "";
  let option = "";
  let select_close = "";

  if (switcher == null) {
    let select_open =
      '\n<select name="switcher_dropdown" id="switcher_dropdown" accesskey="s" onchange="switch_css(this.value)">\n';

    // Add Huement Options
    for (i = 0; i < hui_cssFiles.length; i++) {
      f = hui_cssFiles[i];
      fname = f.name;
      noext = fname.substr(0, fname.lastIndexOf("."));
      framework_name = capitalize(noext) + "  [" + f.size + "] ";
      if (noext != "" && noext != null) {
        option =
          '<option value="' + f.url + '">' + framework_name + "</option>\n";
        dropdown = dropdown + option;
      }
    }

    // Add Global Options
    for (i = 0; i < frameworks_array.length; i++) {
      f = frameworks_array[i];
      framework_name = capitalize(f);
      option = '<option value="' + f + '">' + framework_name + "</option>\n";
      dropdown = dropdown + option;
    }

    select_close = "</select>\n";
    dropdown = select_open + dropdown + select_close;

    switcherWrap.innerHTML = dropdown;
  } else {
    for (i = 0; i < hui_cssFiles.length; i++) {
      f = hui_cssFiles[i];
      fname = f.name;
      noext = fname.substr(0, fname.lastIndexOf("."));
      if (noext != "" && noext != null) {
        framework_name = capitalize(noext) + "  [" + f.size + "] ";
        switcher.options[switcher.options.length] = new Option(
          framework_name,
          f.url
        );
      }
    }

    for (i = 0; i < frameworks_array.length; i++) {
      f = frameworks_array[i];
      framework_name = capitalize(f);
      switcher.options[switcher.options.length] = new Option(framework_name, f);
    }
  }
};

//──── CSS CURRENT VALUES WIDGET ─────────────────────────────────────────────────────────
//let btn2 = document.getElementById("btn2");
let screenW = false;
let screenH = false;
let windowW = false;
let windowH = false;

// eslint-disable-next-line no-unused-vars
let toggle_visibility = function (id) {
  let e = document.getElementById(id);
  e.classList.toggle("showit");
  console.log("clicked");
  return;
};

let updateMeasurements = function () {
  document.querySelector("[data-viewport]").innerText =
    windowW + "px × " + windowH + "px";
  document.querySelector("[data-screen]").innerText =
    screenW + "px × " + screenH + "px";
};

let grabMQData = function () {
  let mqInfo = getComputedStyle(document.getElementById("mq"), ":after")
    .getPropertyValue("content")
    .replace(/['"]+/g, "");
  document.querySelector("[data-mq]").innerText = mqInfo;
  document.querySelector("[data-mq2]").innerText = mqInfo;
};

let grabFontScaleData = function () {
  let fontSize = getComputedStyle(document.getElementById("fontSize"), ":after")
    .getPropertyValue("content")
    .replace(/['"]+/g, "");
  let lineHeight = getComputedStyle(
    document.getElementById("lineHeight"),
    ":after"
  )
    .getPropertyValue("content")
    .replace(/['"]+/g, "");
  let typeScale = getComputedStyle(document.getElementById("scale"), ":after")
    .getPropertyValue("content")
    .replace(/['"]+/g, "");
  document.querySelector("[data-fontsize]").innerText = fontSize;
  document.querySelector("[data-lineheight]").innerText = lineHeight;
  document.querySelector("[data-scale]").innerText = typeScale;
  console.log("Widget Updated!");
};

let calcScreen = function () {
  screenW = screen.width;
  screenH = screen.height;
  windowW = Math.max(document.documentElement.clientWidth, window.innerWidth);
  windowH = Math.max(document.documentElement.clientHeight, window.innerHeight);

  updateMeasurements();

  // Load Media Query Data (provided via SCSS)
  grabMQData();

  // Load Font Scale Data
  grabFontScaleData();
};

let gridHeight = function () {
  let sHeight = screen.height;
  document.getElementById("data-grid").style.height = sHeight;
};

// Creates empty <div>s to be filled with CSS content
let add_widget_divs = function () {
  let div_ids = [
    { id: "size-viewer", class: "wrapper_debug_size_viewer" },
    { id: "data-grid", class: "vert_debug_grid" },
    { id: "scale", class: "noClass" },
    { id: "fontSize", class: "noClass" },
    { id: "lineHeight", class: "noClass" },
    { id: "mq", class: "noClass" },
  ];

  let new_div = "";
  div_ids.forEach(function (val) {
    new_div = document.createElement("div");
    new_div.id = val.id;
    new_div.classList.add(val.class);
    new_div.innerHTML = "&nbsp;";
    document.body.append(new_div);
  });
};

//──── TYPOGRAPHY TOOLS ─────────────────────────────────
let forEach = function (arr, callback) {
  Array.prototype.forEach.call(arr, callback);
};

let hasParentMatch = function (target, selector) {
  return [...document.querySelectorAll(selector)].some(
    (el) => el !== target && el.contains(target)
  );
};

// Helper Functions for H Tag fontsize / lineheight
const hTags = ["h1", "h2", "h3", "h4", "h5", "h6"];
let anchor = "";
let anchorBox = "";
let HLIST = "";
let styleFS = "";
let lineHeight = "";
let styleLH = "";
let fontSize = "";

let debugType = function () {
  //console.log("Debug Heading Typography");

  let TLIST = document.getElementsByClassName("debug_headers");
  if (TLIST.length < 1) {
    //console.log("No .debug_headers found!");
    return false;
  }

  // Foreach Header tag type, we get the individual tag and append
  // a span element containing the font-size & line-height values
  forEach(hTags, function (ele) {
    HLIST = document.getElementsByTagName(ele);

    for (let i = 0; i < HLIST.length; i++) {
      if (hasParentMatch(HLIST[i], ".debug_headers")) {
        styleFS = window
          .getComputedStyle(HLIST[i], null)
          .getPropertyValue("font-size");

        fontSize = Math.ceil(parseFloat(styleFS));

        styleLH = window
          .getComputedStyle(HLIST[i], null)
          .getPropertyValue("line-height");

        lineHeight = Math.ceil(parseFloat(styleLH));

        anchorBox = HLIST[i].getElementsByClassName("header-tag").length;

        if (anchorBox != undefined && anchorBox > 0) {
          // Set HTML
          anchor = HLIST[i].getElementsByClassName("header-tag");
          anchor[0].innerHTML = fontSize + "/" + lineHeight + "px";
          //console.log("Updating....");
        } else {
          anchor = document.createElement("span");
          anchor.className = "header-tag mr-2 text-grey";
          anchor.innerHTML = fontSize + "/" + lineHeight + "px";
          HLIST[i].appendChild(anchor);
        }
      }
    }
  });
};

//──── GLOBAL EVENT LISTENERS ────────────────────────────────────────────────────────────
let winresized = function () {
  gridHeight();
  calcScreen();
  debugType();
};

let winloaded = function () {
  //add_inline_switcher();
  huementINIT();

  add_widget_divs();
  calcScreen();
  gridHeight();
  debugType();
};

window.addEventListener("load", winloaded);
window.addEventListener("resize", winresized);
window.addEventListener("orientationchange", winresized);
