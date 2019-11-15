$(document).ready(function() {
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
  $.each(files, (index, item) => {
    galleryItems.push({
        "type": "thumbnailUrl",
        "value": $(item).text(),
        "tags": null,
        "index": index,
        "class": [`thumbnail-${index}`]
      });
  });
  $('.image-gallery').after(' <div class="load-more-images">Loading more Images</div>');

  loadImageBatch();

  function generateThumbnail(galleryItem) {
    var element;
    if (galleryItem.value) {
      var thumbnailSrc = `${path}/w${thumbnailSrcsetSizes[0]}/${galleryItem.value}`;
      var thumbnailSrcSetAttr = thumbnailSrcsetSizes.map(item => {
        return `${path}/w${item}/${galleryItem.value} ${item}w`;
      }).join(', ');

      var fullSizeHref = `${path}/w${fullSizeScrset[0]}/${galleryItem.value}`;
      var fullSizeSrcsetAttr = fullSizeScrset.map(item => {
        return `${path}/w${item}/${galleryItem.value} ${item}w`;
      }).join(', ');   

      var additionalClasses = galleryItem.class.join(' ');

      element = `
      <a class="gallery-thumbnail ${additionalClasses}" data-fancybox="gallery" href="${fullSizeHref}" data-srcset="${fullSizeSrcsetAttr}" ><img srcset="${thumbnailSrcSetAttr}" sizes="${thumbnailSizesAttr}" src="${thumbnailSrc}">
      </a>`;
    }
    return element;
  }

  $("[data-fancybox='gallery']").fancybox({
    idleTime: 9999999,
  });
  function loadImageBatch() {
    currentlyLoadingImages = true;
    function thumbnailRequestComplete(fakeImage, galleryItem, currentBatch) {
      galleryItem.loaded = true;
      if (currentBatch.filter(item => { return !item.loaded; }).length === 0) {
        currentlyLoadingImages = false;
        checkLoad();
      }
    }
    var currentBatch = galleryItems.filter(item => {
      return !item.loaded;
    }).slice(0, batchSize);
    $.each(currentBatch, function(_index, galleryItem) {
      $('.image-gallery').append(generateThumbnail(galleryItem));
      var thumbnailElement = $(`.thumbnail-${galleryItem.index}`);
      var thumbnailImage = thumbnailElement.find('img');
      thumbnailImage.on('load', function(responseTxt) {
        thumbnailRequestComplete(this, galleryItem, currentBatch);
        setThumbnailBackgroundImage(thumbnailElement);
      }).on('error', function(responseTxt) {
        thumbnailRequestComplete(this, galleryItem, currentBatch);
        $(thumbnailElement).addClass('failed');
      });
      setTimeout(function() { // For bug on FF mobile where some images hang and don't return error or done.
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