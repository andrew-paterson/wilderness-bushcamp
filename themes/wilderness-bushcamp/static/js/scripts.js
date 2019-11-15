// @js-append '../_shared/general.js'
// @js-append '../_shared/scroll-detection.js'
// @js-append '../_shared/mobile-nav-toggler.js'
"use strict";
"use strict";

var links = document.querySelectorAll('a');
var i;

for (i = 0; i < links.length; i++) {
  var link = links[i];

  if (link.hostname !== window.location.hostname) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
}

function GetIEVersion() {
  var sAgent = window.navigator.userAgent;
  var Idx = sAgent.indexOf("MSIE"); // If IE, return version number.

  if (Idx > 0) return parseInt(sAgent.substring(Idx + 5, sAgent.indexOf(".", Idx))); // If IE 11 then look for Updated user agent string.
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
    svg.setAttribute("style", "width: ".concat(newWidth, "px"));
  } else if (rectWidthHeight < viewBoxDimensions) {
    var newHeight = rect.width * viewBoxHeight / viewBoxWidth;
    svg.setAttribute("style", "height: ".concat(newHeight, "px"));
  }
}

if (GetIEVersion() > 0) {
  var svgs = document.querySelectorAll('svg');
  var j;

  for (j = 0; j < svgs.length; j++) {
    var svg = svgs[j];
    setSVGsize(svg);
  }
}
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
"use strict";

var mobileNavToggler = document.querySelector('.mobile-nav-toggler');
mobileNavToggler.addEventListener('click', function () {
  var menuHeight = document.querySelector('ul.menu').clientHeight;

  if (mobileNavToggler.classList.contains('active')) {
    document.querySelector('nav.main').style.height = '0';
    mobileNavToggler.classList.remove('active');
  } else {
    document.querySelector('nav.main').style.height = "".concat(menuHeight, "px");
    mobileNavToggler.classList.add('active');
  }
});