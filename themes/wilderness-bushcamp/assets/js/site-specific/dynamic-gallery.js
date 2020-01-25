$(document).ready(function() {
  var currentlyLoadingImages = false;
  var batchSize = 6;
  var thumbnailSrcsetSizes = [480, 160];
  var thumbnailSizesAttr = '(max-width: 400px) 130px, 300px';
  var files = $('.gallery-files li');
  var path = $('.gallery-files').attr('data-gallery-path');

  var galleryItems = [];

  $("[data-fancybox='gallery']").fancybox({
    idleTime: 9999999,
  });

  var fileNames = [];
  var commonFileNames = [];
  $.each(files, (index, file) => {
    fileNames.push($(file).text());
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
  $('.image-gallery').after(' <div class="load-more-images">Loading more Images</div>');

  // galleryItems.forEach(galleryItem => {
  //   $('.image-gallery').append(generateGalleryElement(galleryItem));
  // });

  loadImageBatch();

  function generateGalleryElement(galleryItem) {
    var element;
    if (galleryItem.versions.length > 0) {
      var fullSizeHref = `${path}/${galleryItem.commonName}-${galleryItem.versions[0].size}.${galleryItem.versions[0].ext}`;
      var fullSizeSrcsetAttr = galleryItem.versions.map(item => {
        return `${path}/${galleryItem.commonName}-${item.size}.${item.ext} ${item.size}`;
      }).join(', ');   

      var additionalClasses = galleryItem.class.join(' ');

      element = `
      <a class="gallery-thumbnail ${additionalClasses}" data-fancybox="gallery" href="${fullSizeHref}" data-srcset="${fullSizeSrcsetAttr}" style="display: non;" data-thumbnail-id=${galleryItem.index}>
      <img srcset="${fullSizeSrcsetAttr}" sizes="${thumbnailSizesAttr}" src="${fullSizeHref}">
      </a>`;
    }
    return element;
  }

  function generateThumbnail(galleryItem) {
    var element;
    if (galleryItem.value) {
      var thumbnailSrc = `${path}/${galleryItem.value}`;
      var thumbnailSrcSetAttr = thumbnailSrcsetSizes.map(item => {
        return `${path}/${galleryItem.value} ${item}w`;
      }).join(', ');

      element = `
      <img srcset="${thumbnailSrcSetAttr}" sizes="${thumbnailSizesAttr}" src="${thumbnailSrc}">`;
    }
    return element;
  }

  
  function loadImageBatch() {
    console.log('loadImageBatch');
    currentlyLoadingImages = true;
    function thumbnailRequestComplete(fakeImage, galleryItem, currentBatch) {
      galleryItem.loaded = true;
      if (currentBatch.filter(item => { return !item.loaded; }).length === 0) {
        currentlyLoadingImages = false;
        checkLoad(); //Check for a new batch whenever the current batch finishes.
      }
    }
    var currentBatch = galleryItems.filter(item => {
      return !item.loaded;
    }).slice(0, batchSize);
    $.each(currentBatch, function(_index, galleryItem) {
      $('.image-gallery').append(generateGalleryElement(galleryItem));
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
      setGalleryImageHeight(thumbnailElement);
    });
  }

  function checkLoad() {
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
    loadImageBatch();
  }

  $('#wrapper').scroll(function() {
    checkLoad();
  });

  function setGalleryImageHeight(thumbnailElement) {
    if (thumbnailElement) {
      var thumbnailHeightWidthRatio;
      if ($('.image-gallery').attr('data-thumbnail-dimensions')) {
        var dimensions = $('.image-gallery').attr('data-thumbnail-dimensions').split(":");
        thumbnailHeightWidthRatio = dimensions[1]/dimensions[0];
      } else {
        thumbnailHeightWidthRatio = 1;
      }
      var width = $(thumbnailElement).css('width').replace('px', '');
      var height = width*thumbnailHeightWidthRatio;
      $(thumbnailElement).css('height', height);
    }
  }

  $(window).resize(function() {
    var thumbnailElements = $("a.gallery-thumbnail");
    $.each(thumbnailElements, function(index, item) {
      setGalleryImageHeight(item);
    });
  });
});