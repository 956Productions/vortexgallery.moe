function rulesPage(t) {
    if ( t != '' && t != '#' ) {
        $(".rules-btn").toggleClass('is-active', false);
        $("#btn-"+t.replace("#","")).toggleClass('is-active',true);
        $(".rules-div").toggleClass('is-hidden', true);
        $(t).toggleClass('is-hidden',false);
        window.location.hash = t;
    }
}

window.onload = function()
{
    if(!window.jQuery)
    {
        alert('jQuery not loaded');
    }
    else
    {
        jQuery(document).ready(function(){
            jQuery.get('js/quotes.txt', function(txt) {
                var quotes = txt.split("\n");
                var randLineNum = Math.floor(Math.random()*(quotes.length));
                jQuery('#quote').append(quotes[randLineNum]);
            });
        });
    }
}
$(document).ready(function() {
    $(".navbar-burger").click(function() {
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
    });
    $(".rules-btn").click(function() {
        rulesPage("#"+$(this).data('target'));
    });
    window.addEventListener('hashchange', rulesPage(location.hash));
});

document.addEventListener('DOMContentLoaded', () => {
    // Functions to open and close a modal
    function openModal($el) {
      $el.classList.add('is-active');
    }
  
    function closeModal($el) {
      $el.classList.remove('is-active');
    }
  
    function closeAllModals() {
      (document.querySelectorAll('.modal') || []).forEach(($modal) => {
        closeModal($modal);
      });
    }
  
    // Add a click event on buttons to open a specific modal
    (document.querySelectorAll('.modal-trigger') || []).forEach(($trigger) => {
      const modal = $trigger.dataset.target;
      const $target = document.getElementById(modal);
  
      $trigger.addEventListener('click', () => {
        openModal($target);
      });
    });
  
    // Add a click event on various child elements to close the parent modal
    (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
      const $target = $close.closest('.modal');
  
      $close.addEventListener('click', () => {
        closeModal($target);
      });
    });
  
    // Add a keyboard event to close all modals
    document.addEventListener('keydown', (event) => {
      const e = event || window.event;
  
      if (e.keyCode === 27) { // Escape key
        closeAllModals();
      }
    });
  });