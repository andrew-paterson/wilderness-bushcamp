// @js-append '../_shared/general.js'
// @js-append '../_shared/scroll-detection.js'
// @js-append '../_shared/mobile-nav-toggler.js'
// @js-append '../site-specific/dynamic-gallery.js'
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
"use strict";

$(document).ready(function () {
  var currentlyLoadingImages = false;
  var batchSize = 3;
  var totalImagesLoaded = 0;
  var totalImagesInGallery;
  var thumbnailSrcsetSizes = [480, 160];
  var thumbnailSizesAttr = '(max-width: 400px) 130px, 300px';
  var fullSizeScrset = [1440, 768, 480];
  var files = $('.gallery-files li');
  var path = $('.gallery-files').attr('data-gallery-path');
  var galleryItems = [];
  $.each(files, function (index, item) {
    galleryItems.push({
      "type": "thumbnailUrl",
      "value": $(item).text(),
      "tags": null,
      "index": index,
      "class": ["thumbnail-".concat(index)]
    });
  });
  $('.image-gallery').after(' <div class="load-more-images">Loading more Images</div>');
  loadImageBatch();

  function generateThumbnail(galleryItem) {
    var element;

    if (galleryItem.value) {
      var thumbnailSrc = "".concat(path, "/w").concat(thumbnailSrcsetSizes[0], "/").concat(galleryItem.value);
      var thumbnailSrcSetAttr = thumbnailSrcsetSizes.map(function (item) {
        return "".concat(path, "/w").concat(item, "/").concat(galleryItem.value, " ").concat(item, "w");
      }).join(', ');
      var fullSizeHref = "".concat(path, "/w").concat(fullSizeScrset[0], "/").concat(galleryItem.value);
      var fullSizeSrcsetAttr = fullSizeScrset.map(function (item) {
        return "".concat(path, "/w").concat(item, "/").concat(galleryItem.value, " ").concat(item, "w");
      }).join(', ');
      var additionalClasses = galleryItem.class.join(' ');
      element = "\n      <a class=\"gallery-thumbnail ".concat(additionalClasses, "\" data-fancybox=\"gallery\" href=\"").concat(fullSizeHref, "\" data-srcset=\"").concat(fullSizeSrcsetAttr, "\" ><img srcset=\"").concat(thumbnailSrcSetAttr, "\" sizes=\"").concat(thumbnailSizesAttr, "\" src=\"").concat(thumbnailSrc, "\">\n      </a>");
    }

    return element;
  }

  $("[data-fancybox='gallery']").fancybox({
    idleTime: 9999999
  });

  function loadImageBatch() {
    currentlyLoadingImages = true;

    function thumbnailRequestComplete(fakeImage, galleryItem, currentBatch) {
      galleryItem.loaded = true;

      if (currentBatch.filter(function (item) {
        return !item.loaded;
      }).length === 0) {
        currentlyLoadingImages = false;
        checkLoad();
      }
    }

    var currentBatch = galleryItems.filter(function (item) {
      return !item.loaded;
    }).slice(0, batchSize);
    $.each(currentBatch, function (_index, galleryItem) {
      $('.image-gallery').append(generateThumbnail(galleryItem));
      var thumbnailElement = $(".thumbnail-".concat(galleryItem.index));
      var thumbnailImage = thumbnailElement.find('img');
      thumbnailImage.on('load', function (responseTxt) {
        thumbnailRequestComplete(this, galleryItem, currentBatch);
        setThumbnailBackgroundImage(thumbnailElement);
      }).on('error', function (responseTxt) {
        thumbnailRequestComplete(this, galleryItem, currentBatch);
        $(thumbnailElement).addClass('failed');
      });
      setTimeout(function () {
        // For bug on FF mobile where some images hang and don't return error or done.
        if (!galleryItem.loaded) {
          thumbnailRequestComplete(thumbnailImage, galleryItem, currentBatch);
        }
      }, 5000);
      setGalleryImageHeight(thumbnailElement);
    });
  }

  function setThumbnailBackgroundImage(thumbnailElement) {
    thumbnailElement.css("background-image", "url(".concat(thumbnailElement.find('img')[0].currentSrc, ")")).css("display", "block");
  }

  function checkLoad() {
    if (galleryItems.filter(function (item) {
      return !item.loaded;
    }).length === 0) {
      $(".load-more-images").remove();
      return;
    }

    var trigger = $(".load-more-images");

    if (!trigger.offset()) {
      return;
    }

    var trigger_position = trigger.offset().top - $(window).outerHeight();

    if (trigger_position > $(window).scrollTop() || currentlyLoadingImages) {
      return;
    }

    loadImageBatch();
  }

  $('#wrapper').scroll(function () {
    checkLoad();
  });

  function setGalleryImageHeight(thumbnailElement) {
    if (thumbnailElement) {
      var thumbnailHeightWidthRatio;

      if ($('.image-gallery').attr('data-thumbnail-dimensions')) {
        var dimensions = $('.image-gallery').attr('data-thumbnail-dimensions').split(":");
        thumbnailHeightWidthRatio = dimensions[1] / dimensions[0];
      } else {
        thumbnailHeightWidthRatio = 1;
      }

      var width = $(thumbnailElement).css('width').replace('px', '');
      var height = width * thumbnailHeightWidthRatio;
      $(thumbnailElement).css('height', height);
    }
  }

  $(window).resize(function () {
    var thumbnailElements = $("a.gallery-thumbnail");
    $.each(thumbnailElements, function (index, item) {
      setGalleryImageHeight(item);
    });
  });
});