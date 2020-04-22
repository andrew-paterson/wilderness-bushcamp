function loadImageBatch(url, num) {
  currentlyLoadingImages = true;
  return new Promise(function(resolve, reject) { 
    request({uri: url}, function(err, response, body){ 
      if (response.statusCode === 200){
        resolve(`${num}: ${response.statusCode}`);  // fulfilled successfully
      } else {
        reject(err);  // error, rejected
      }
    });
  });
}

function loadImageBatch() {
  
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