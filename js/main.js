// Import the Bootstrap components that you are using
import Popover from 'bootstrap/js/dist/popover';
import Carousel from 'bootstrap/js/dist/carousel';

// Import Bootstrap scss
import '../scss/styles.scss';


// Create an example popover
// Initialize all popover elements
document.querySelectorAll('[data-bs-toggle="popover"]').forEach(popoverNode => {
  new Popover(popoverNode);
});
