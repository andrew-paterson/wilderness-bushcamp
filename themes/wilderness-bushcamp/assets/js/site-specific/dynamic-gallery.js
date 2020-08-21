var galleries = document.querySelectorAll('.image-gallery');
galleries.forEach(gallery => {
  doGallery(gallery);
});

$(window).resize(function() {
  galleries.forEach(gallery => {
    var thumbnailElements = gallery.querySelectorAll('a.gallery-thumbnail');
    thumbnailElements.forEach(thumbnailElement => {
      setGalleryImageHeight(thumbnailElement, gallery);
    });
  });
});

$('#wrapper').scroll(function() {
  galleries.forEach(gallery => {
    checkLoad(gallery, galleryItems(gallery));
  });
});

$("[data-fancybox='gallery']").fancybox({
  idleTime: 9999999,
});

function galleryItems(element) {
  var files = element.querySelectorAll('.gallery-files li');
  var galleryItems = [];
  var fileNames = [];
  var commonFileNames = [];
  files.forEach(file => {
    fileNames.push(file.textContent);
  });
  fileNames.forEach(filename => {
    var common = filename.split('-').slice(0, -1).join('-');
    commonFileNames.push(common);
  });
  let uniqueFileNames = commonFileNames.filter((item, i, ar) => ar.indexOf(item) === i);
  uniqueFileNames.forEach((uniqueFileName, index) => {
    var fullFileNames = fileNames.filter(filename => {
      return filename.split('-').slice(0, -1).join('-') === uniqueFileName;
    });
    var sizeStrings = fullFileNames.map(fullFileName => {
      var lastPart = fullFileName.split('-')[fullFileName.split('-').length - 1];
      return {
        size: lastPart.split('.')[0],
        ext: lastPart.split('.')[1],
      };
    });
    galleryItems.push({
      type: "thumbnailUrl",
      commonName: uniqueFileName,
      versions: sizeStrings,
      tags: null,
      index: index,
      class: [`thumbnail-${index}`]
    });
  });
  return galleryItems;
}

// $(document).ready(function() {
var currentlyLoadingImages = false;
var batchSize = 9;
var thumbnailSizesAttr = '(max-width: 400px) 130px, 300px';

function doGallery(element) {
  $('.image-gallery').after(' <div class="load-more-images">Loading more Images</div>');
  loadImageBatch(element, galleryItems(element));
}

function generateGalleryElement(galleryItem, element) {
  var thumbnailHTML;
  var path = element.querySelector('.gallery-files').getAttribute('data-gallery-path');
  if (galleryItem.versions.length > 0) {
    var fullSizeHref = `${path}/${galleryItem.commonName}-${galleryItem.versions[0].size}.${galleryItem.versions[0].ext}`;
    var fullSizeSrcsetAttr = galleryItem.versions.map(item => {
      return `${path}/${galleryItem.commonName}-${item.size}.${item.ext} ${item.size}`;
    }).join(', ');   

    var additionalClasses = galleryItem.class.join(' ');

    thumbnailHTML = `
    <a class="gallery-thumbnail ${additionalClasses}" data-fancybox="gallery" href="${fullSizeHref}" data-srcset="${fullSizeSrcsetAttr}" style="display: non;" data-thumbnail-id=${galleryItem.index}>
    <img srcset="${fullSizeSrcsetAttr}" sizes="${thumbnailSizesAttr}" src="${fullSizeHref}">
    </a>`;
  }
  return thumbnailHTML;
}

function loadImageBatch(element, galleryItems) {
  currentlyLoadingImages = true;
  function thumbnailRequestComplete(fakeImage, galleryItem, currentBatch) {
    galleryItem.loaded = true;
    if (currentBatch.filter(item => { return !item.loaded; }).length === 0) {
      currentlyLoadingImages = false;
      checkLoad(element, galleryItems); //Check for a new batch whenever the current batch finishes.
    }
  }
  var currentBatch = galleryItems.filter(item => {
    return !item.loaded;
  }).slice(0, batchSize);
  currentBatch.forEach((galleryItem) => {
    element.insertAdjacentHTML('beforeend', generateGalleryElement(galleryItem, element));
    // Make vanilla javascript
    var thumbnailElement = $(`.thumbnail-${galleryItem.index}`);
    var thumbnailImage = thumbnailElement.find('img');
    thumbnailImage.on('load', function(responseTxt) {
      thumbnailRequestComplete(this, galleryItem, currentBatch);
    }).on('error', function(responseTxt) {
      thumbnailRequestComplete(this, galleryItem, currentBatch);
      $(thumbnailElement).addClass('failed');
    });
    setTimeout(function() { // Allow user to move on if one thumbnail is taking very long.
      if (!galleryItem.loaded) {
        thumbnailRequestComplete(thumbnailImage, galleryItem, currentBatch);
      }  
    }, 5000);
    setGalleryImageHeight(thumbnailElement, element);
  });
}

function checkLoad(element, galleryItems) {
  // When all images have loaded.
  if (galleryItems.filter(item => { return !item.loaded; }).length === 0) {
    $(".load-more-images").remove();
    return;
  }
  var trigger = $(".load-more-images");
  if (!trigger.offset()) {
    return;
  }
  var trigger_position =  trigger.offset().top - $(window).outerHeight();
  if (trigger_position > $(window).scrollTop() || currentlyLoadingImages) {
    return;
  }
  loadImageBatch(element, galleryItems);
}

function setGalleryImageHeight(thumbnailElement, galleryElement) {
  if (thumbnailElement) {
    var thumbnailHeightWidthRatio;
    if (galleryElement.getAttribute('data-thumbnail-dimensions')) {
      var dimensions = galleryElement.getAttribute('data-thumbnail-dimensions').split(":");
      thumbnailHeightWidthRatio = dimensions[1]/dimensions[0];
    } else {
      thumbnailHeightWidthRatio = 1;
    }
    // change to Vanilla JS.
    var width = $(thumbnailElement).css('width').replace('px', '');
    var height = width*thumbnailHeightWidthRatio;
    $(thumbnailElement).css('height', height);
  }
}