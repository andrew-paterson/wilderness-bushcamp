"use strict";

if (GetIEVersion() > 0) {
  // IE pollyfills (Will only load in IE).
  // add https://github.com/tonipinel/object-fit-polyfill/ for usage instructions
  document.write('<script src="https://cdn.jsdelivr.net/npm/object-fit-polyfill@0.1.0/dist/object-fit-polyfill.min.js"></script>');
  document.write("<script src=\"https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.min.js\"></script> ");
  var svgs = document.querySelectorAll('svg');
  var j;

  for (j = 0; j < svgs.length; j++) {
    var svg = svgs[j];
    setSVGsize(svg);
  }
} //https://stackoverflow.com/questions/53331180/babel-polyfill-being-included-but-foreach-still-doesnt-work-in-ie11-on-nodelis


if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
} // :scope polyfill


(function (doc, proto) {
  try {
    // check if browser supports :scope natively
    doc.querySelector(':scope body');
  } catch (err) {
    // polyfill native methods if it doesn't
    ['querySelector', 'querySelectorAll'].forEach(function (method) {
      var nativ = proto[method];

      proto[method] = function (selectors) {
        if (/(^|,)\s*:scope/.test(selectors)) {
          // only if selectors contains :scope
          var id = this.id; // remember current element id

          this.id = 'ID_' + Date.now(); // assign new unique id

          selectors = selectors.replace(/((^|,)\s*):scope/g, '$1#' + this.id); // replace :scope with #ID

          var result = doc[method](selectors);
          this.id = id; // restore previous id

          return result;
        } else {
          return nativ.call(this, selectors); // use native code for other selectors
        }
      };
    });
  }
})(window.document, Element.prototype);

var links = document.querySelectorAll('a');
var i;

for (i = 0; i < links.length; i++) {
  var link = links[i];

  if (link.getAttribute('href').startsWith('#')) {
    link.setAttribute('data-accordion-link', '');
  }

  if (link.hostname !== window.location.hostname && !link.getAttribute('href').startsWith('#')) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
}

function GetIEVersion() {
  var sAgent = window.navigator.userAgent;
  var Idx = sAgent.indexOf('MSIE'); // If IE, return version number.

  if (Idx > 0) return parseInt(sAgent.substring(Idx + 5, sAgent.indexOf('.', Idx))); // If IE 11 then look for Updated user agent string.
  else if (navigator.userAgent.match(/Trident\/7\./)) return 11;else return 0; //It is not IE
}

function setSVGsize(svg) {
  var rect = svg.getBoundingClientRect();
  var viewBox = svg.getAttribute('viewBox').split(/\s+|,/);

  if (!viewBox) {
    return;
  }

  var viewBoxWidth = parseFloat(viewBox[2]);
  var viewBoxHeight = parseFloat(viewBox[3]);
  var rectWidthHeight = rect.width / rect.height;
  var viewBoxDimensions = viewBoxWidth / viewBoxHeight;

  if (rectWidthHeight > viewBoxDimensions) {
    var newWidth = rect.height * viewBoxWidth / viewBoxHeight;
    svg.setAttribute('style', "width: ".concat(newWidth, "px"));
  } else if (rectWidthHeight < viewBoxDimensions) {
    var newHeight = rect.width * viewBoxHeight / viewBoxWidth;
    svg.setAttribute('style', "height: ".concat(newHeight, "px"));
  }
}

var menuItems = document.querySelectorAll('.menu li');

for (i = 0; i < menuItems.length; ++i) {
  var descendantLinks = menuItems[i].querySelectorAll('a');

  for (j = 0; j < descendantLinks.length; ++j) {
    var link = descendantLinks[j];

    if (link.attributes.href.nodeValue === '#' || !link.attributes.href.nodeValue) {
      continue;
    }

    if ("".concat(link.origin).concat(link.pathname).replace(/\/$/, '') === "".concat(window.location.origin).concat(window.location.pathname).replace(/\/$/, '')) {
      menuItems[i].classList.add('active');
    }
  }
}

document.querySelectorAll('ul.level-2').forEach(function (childMenu) {
  childMenu.onmouseenter = function () {
    childMenu.parentElement.classList.add('highlighted');
  };

  childMenu.onmouseleave = function () {
    childMenu.parentElement.classList.remove('highlighted');
  };
});

;
"use strict";

var mobileNavToggler = document.querySelector('.mobile-nav-toggler');

if (mobileNavToggler) {
  mobileNavToggler.addEventListener('click', function () {
    var menuHeight = document.querySelector('ul.menu').clientHeight;

    if (mobileNavToggler.classList.contains('active')) {
      document.querySelector('nav.main .nav-ul-container').style.height = '0';
      mobileNavToggler.classList.remove('active');
    } else {
      document.querySelector('nav.main .nav-ul-container').style.height = "".concat(menuHeight, "px");
      mobileNavToggler.classList.add('active');
    }
  });
}

;
"use strict";

var wrapperElem = document.querySelector('#wrapper');
document.querySelector('body').classList.add('unscrolled');

function setScrollClass() {
  var scrollTop = wrapperElem.scrollTop;

  if (scrollTop === 0) {
    document.querySelector('body').classList.remove('scrolled');
    document.querySelector('body').classList.add('unscrolled');
  } else {
    document.querySelector('body').classList.add('scrolled');
    document.querySelector('body').classList.remove('unscrolled');
  }
}

setScrollClass();
wrapperElem.addEventListener('scroll', function () {
  setScrollClass();
});

;
"use strict";

function constrainImageHeight(element) {
  var dimensions = element.getAttribute('data-dimensions').split(':');
  var widthRatio = parseInt(dimensions[0]);
  var heightRatio = parseInt(dimensions[1]);
  var adjustedHeight = Math.ceil(element.offsetWidth / widthRatio * heightRatio);
  element.style.height = "".concat(adjustedHeight, "px");
}

function constrainImageHeights() {
  var dimensionedElements = document.querySelectorAll('[data-dimensions]');
  dimensionedElements.forEach(function (element) {
    constrainImageHeight(element);
  });
}

constrainImageHeights();
window.addEventListener("resize", constrainImageHeights);

;
"use strict";
