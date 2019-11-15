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
  var Idx = sAgent.indexOf("MSIE");

  // If IE, return version number.
  if (Idx > 0) 
    return parseInt(sAgent.substring(Idx+ 5, sAgent.indexOf(".", Idx)));

  // If IE 11 then look for Updated user agent string.
  else if (navigator.userAgent.match(/Trident\/7\./)) 
    return 11;

  else
    return 0; //It is not IE
}

function setSVGsize(svg) {
  var rect = svg.getBoundingClientRect();
  var viewBox = svg.getAttribute('viewBox').split(/\s+|,/);
  if (!viewBox) { return; }
  var viewBoxWidth = parseFloat(viewBox[2]);
  var viewBoxHeight = parseFloat(viewBox[3]);
  var rectWidthHeight = rect.width/rect.height;
  var viewBoxDimensions = viewBoxWidth/viewBoxHeight;
  if (rectWidthHeight > viewBoxDimensions) {
    var newWidth = rect.height*viewBoxWidth/viewBoxHeight;
    svg.setAttribute("style", `width: ${newWidth}px`);
  } else if (rectWidthHeight < viewBoxDimensions) {
    var newHeight = rect.width*viewBoxHeight/viewBoxWidth;
    svg.setAttribute("style", `height: ${newHeight}px`);
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
   