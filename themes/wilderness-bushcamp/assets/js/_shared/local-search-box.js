function beginsWith(needle, haystack){
  return (haystack.toLowerCase().substr(0, needle.length) === needle.toLowerCase());
}

function highlightMatches(needle, haystack) {
  var queryMatch = new RegExp(needle, 'gi');
  return haystack.replace(queryMatch, function(iMatch) {
    return '<span class="highlighted">' + iMatch + '</span>';
  });
}

function getExcerpt(text, charIndex, precision) {
  // index is the index of the word which the charIndex falls in.
  var index = text.substring(0, charIndex).split(' ').length - 1;
  var words = text.split(' ');
  var result = [];
  var startIndex, stopIndex;

  startIndex = index - precision;
  if (startIndex < 0) {
    startIndex = 0;
  }

  stopIndex = index + precision + 1;
  if (stopIndex > words.length) {
    stopIndex = words.length;
  }

  result = result.concat( words.slice(startIndex, index) );
  result = result.concat( words.slice(index, stopIndex) );
  return result.join(' '); // join back
}

function generateResults(searchIndex, phrase) {
  var wholeWordRegex = new RegExp(`\\b${phrase}\\b`, 'gi');
  var startWordRegex = new RegExp(`(?!\\b${phrase}\\b)\\b${phrase}`, 'gi');
  var midWordRegex = new RegExp(`(?!\\b${phrase}\\b)(?!\\b${phrase})${phrase}`, 'gi');

  if (phrase.length < 3) {
    return;
  }
  var searchResults = [];
  searchIndex.forEach(item => {
    if (!item) {return; }
    var matchTypes = [{
      regex: wholeWordRegex,
      type: 'wholeWord'
    }, {
      regex: startWordRegex,
      type: 'startWord'
    }, {
      regex: midWordRegex,
      type: 'midWord'
    }];

    matchTypes.forEach(matchType => {
      var match;
      while ((match = matchType.regex.exec(item.content)) != null) {
        var existing = searchResults.find(searchResult => {
          return searchResult.href === item.href;
        });
        if (existing) {
          existing.scores[matchType.type] += 1;
          existing.exerpts.push(getExcerpt(match.input, match.index, 3));
          existing.content.push(item.content);
        } else {
          searchResults.push({
            href: item.href,
            scores: {
              wholeWord: 0,
              startWord: 0,
              midWord: 0
            },
            exerpts: [getExcerpt(match.input, match.index, 3)],
            content: [item.content]
          });
        }
      }
    });
  });
  console.log(searchResults);
  
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