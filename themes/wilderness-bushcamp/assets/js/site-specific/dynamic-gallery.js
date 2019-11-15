$(document).ready(function() {
  var currentlyLoadingImages = false;
  var batchSize = 30;
  var totalImagesLoaded = 0;
  var totalImagesInGallery;
  var thumbnailSrcsetSizes = [480, 160];
  var thumbnailSizesAttr = '(max-width: 400px) 130px, 300px';
  var fullSizeScrset = [1440, 768, 480];
  var files = $('.gallery-files li');
  var path = $('.gallery-files').attr('data-gallery-path');
  var galleryItems;

  var galleryElements = [];
  $.each(files, (index, item) => {
      galleryElements.push({
        "type": "thumbnailUrl",
        "value": $(item).text(),
        "tags": null
      });
  });
  generateInitialMarkup(galleryElements);

  function generateInitialMarkup(galleryElements) {
    $.each(galleryElements, function(index, galleryItem) {
      addThumbnail(galleryItem);
    });
    loadImageBatch();
  }
  function addThumbnail(galleryItem) {
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
      element = `
      <a class="gallery-thumbnail" data-fancybox="gallery" href="${fullSizeHref}" data-srcset="${fullSizeSrcsetAttr}" ><img srcset="${thumbnailSrcSetAttr}" sizes="${thumbnailSizesAttr}" src="${thumbnailSrc}">
      </a>`;
    }
    $('.image-gallery').append(element);
  }

  $("[data-fancybox='gallery']").fancybox({
    idleTime: 9999999,
  });
  function loadImageBatch() {
    var endBatch;
    function thumbnailRequestComplete(fakeImage, thumbnailElement) {
      // Remove the fake image element from memory as soon as it has finished downloading, so as not to waste memory.
      $(fakeImage).remove();
      imagesLoaded++;
      totalImagesLoaded ++;

      if (imagesLoaded === batchSize) {
        currentlyLoadingImages = false;
        checkLoad();
      }
      if (totalImagesLoaded === totalImagesInGallery) {
        $(".load-more-images").css("display", "none");
        $('#footer').css('display', 'block');
        $('ul.pager').css('display', 'flex');
      }
    }
    $('footer').css('display', 'none');
    galleryItems = $("a.gallery-thumbnail");
    totalImagesInGallery = galleryItems.length;
    currentlyLoadingImages = true;
    var lastIndex = totalImagesLoaded + batchSize;
    var firstIndex = totalImagesLoaded;
    var thisBatch = galleryItems.slice(firstIndex, lastIndex);
    var imagesLoaded = 0;
    $.each(thisBatch, function(index, element) {
      if (endBatch) {return;}
      var thumbnailElement = $(this);

      // thumbnailElement.children('.gallery-thumbnail-inner').css("background-image", 'url(' + thumbnailPath + ')');
      // Create a fake image element in memory with src set to the thumbnail path, as this gives us a way to know when the image has finished loading.
      var fakeImage = $('<img src="thumbnailPath">');
      setTimeout(function() { // For bug on FF mobile where some images hang and don't return error or done.
        thumbnailRequestComplete(fakeImage, thumbnailElement);
      }, 5000);
      fakeImage.on('load', function(responseTxt) {
        thumbnailRequestComplete(this, thumbnailElement);
      }).on('error', function(responseTxt) {
        thumbnailRequestComplete(this, thumbnailElement);
        $(element).addClass('failed');
      });
      setGalleryImageHeight(thumbnailElement);
    });
  }



  function checkLoad() {
    var trigger = $(".load-more-images");
    var trigger_position =  trigger.offset().top - $(window).outerHeight();
    if (trigger_position > $(window).scrollTop() || currentlyLoadingImages) {
      return;
    }
    loadImageBatch();
  }

  $(window).scroll(function() {
    checkLoad();
  });

  function setGalleryImageHeight(thumbnailElement) {
    console.log('setGalleryImageHeight');
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