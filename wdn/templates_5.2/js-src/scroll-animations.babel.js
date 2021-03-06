require (['dcf-scrollAnimation'], () => {
  const itemList = document.querySelectorAll('.dcf-animate-on-scroll');
  const observerConfig = {
    rootMargin: '0px',
    threshold: [0.5, 1]
  };
  const animationClassNames = ['dcf-animated'];
  const unlScrollAnimation = new DCFScrollAnimation(itemList, observerConfig, animationClassNames);
  unlScrollAnimation.initialize();
});
