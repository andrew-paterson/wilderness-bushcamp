var wrapperElem =  document.querySelector('#wrapper');
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
wrapperElem.addEventListener('scroll', () => {
  setScrollClass();
});

