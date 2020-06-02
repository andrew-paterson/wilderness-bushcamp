function beginsWith(needle, haystack){
  return (haystack.toLowerCase().substr(0, needle.length) === needle.toLowerCase());
}

function highlightMatches(needle, haystack) {
  var queryMatch = new RegExp(needle, 'gi');
  return haystack.replace(queryMatch, function(iMatch) {
    return '<span class="highlighted">' + iMatch + '</span>';
  });
}

function generateResults(searchIndex, phrase) {

  // while ((match = re.exec(str)) != null) {
  //     console.log("match found at " + match.index);
  // }
  if (phrase.length < 3) {
    return;
  }
  var matches = [];
  searchIndex.forEach(item => {
    if (!item) {return; }
    var regex = new RegExp(phrase, 'gi');
    var wholeWordRegex = new RegExp("\\b" + phrase + "\\b", 'gi');
    var startWordRegex = new RegExp("\\b" + phrase, 'gi');
    // console.log(regex.exec(phrase));
    // if (item.content.match(regex)) {
    //   console.log(item.href);
    //   console.log(item.content.match(regex));
    // }
    var match;
     while ((match = startWordRegex.exec(item.content)) != null) {
      console.log(item.href);
      console.log(match);
    }
  
  });
  
  // $.ajax({
  //   url: '/search/search.php',
  //   dataType: 'json',
  //   type: 'post',
  //   data: `prompts=${this.value}`,
  //   success: response => {
  //     var queryString = response.meta.query_string;
  //     let uniqueMatches  = [];
  //     response.data.forEach((object, index, array) => {
  //       var matchObject = object.attributes;
  //       matchObject.matches.forEach(match => {
  //         var existing = uniqueMatches.find(uniqueMatch => {
  //           return uniqueMatch.matchText.toLowerCase() === match.toLowerCase();
  //         });
  //         if (existing) {
  //           existing.matchesCount += matchObject.matchesCount || 0;
  //         } else {
            
  //           var matchesCount = matchObject.matchesCount || 0;
  //           if (beginsWith(response.meta.query_string, match)) {
  //             matchesCount = matchesCount*1000;
  //           }
  //           uniqueMatches.push({
  //             matchText: match.toLowerCase(),
  //             matchesCount: matchesCount,
  //           });
  //         }
  //       });
  //     });
  //     var sortedMatches = uniqueMatches.sort(function(a, b) {
  //       return b.matchesCount - a.matchesCount;
  //     });

  //     if (sortedMatches.length) {
  //       $('.search-hints').html(`<ul></ul>`);
  //       sortedMatches.forEach(match => {
  //         var element = '<li><a href="/search-results?query=' + match.matchText + '">' + highlightMatches(queryString, match.matchText) + '</a></li>';
  //         $('.search-hints ul').append(element);
  //       });
  //     } else {
  //       $('.search-hints').html(`<div class="no-results">No results.</div>`);
  //     }
  //   },
  //   error: error => {
  //     $('.search-hints').html(`<div class="no-results error">There was a server error.</div>`);
  //   }
  // });
}
var searchIndex;

$('#site-search input').keydown(function(event){
  if(event.keyCode == 13) {
    event.preventDefault();
  }
});

$('#site-search button').on('click', function(e, v) {
  var query = $('#site-search input').val();
  e.preventDefault();
  window.location.href = `/search-results?query=${query}`;
});

$('#site-search input').on('keyup', function(e, v) {
  var phrase = this.value;
  if (e.keyCode === 13) {
    window.location.href = `/search-results?query=${phrase}`;
  }
  if (!searchIndex) {
    fetch('/search-index.json').then(result => {
      return result.json();
    }).then(json => {
      searchIndex = json.searchIndex;
      generateResults(searchIndex, phrase);
    });
  } else {
    generateResults(searchIndex, phrase);
  }
  return false;
});