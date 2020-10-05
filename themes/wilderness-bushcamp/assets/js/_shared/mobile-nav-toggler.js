var mobileNavToggler = document.querySelector('.mobile-nav-toggler');
mobileNavToggler.addEventListener('click', () => {
  var menuHeight = document.querySelector('ul.menu').clientHeight;
  if (mobileNavToggler.classList.contains('active')) {
    document.querySelector('nav.main .nav-ul-container').style.height = '0';
    mobileNavToggler.classList.remove('active');
  } else {
    document.querySelector('nav.main .nav-ul-container').style.height = `${menuHeight}px`;
    mobileNavToggler.classList.add('active');
  }
});





