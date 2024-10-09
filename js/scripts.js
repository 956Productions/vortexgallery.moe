function rulesPage(t) {
    if ( t != '' && t != '#' ) {
        $(".rules-btn").toggleClass('is-active', false);
        $("#btn-"+t.replace("#","")).toggleClass('is-active',true);
        $(".rules-div").toggleClass('is-hidden', true);
        $(t).toggleClass('is-hidden',false);
        window.location.hash = t;
    }
}

$(document).ready(function() {
    $.get('js/quotes.txt', function(txt) {
        var quotes = txt.split("\n");
        var randLineNum = Math.floor(Math.random()*(quotes.length));
        $('#quote').append(quotes[randLineNum]);
    });

    $('.timestamp-text').each(function(i,obj) {
        var utcSeconds = $(obj).data('time');
        var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
        d.setUTCSeconds(utcSeconds);
        $(obj).text("Local: " + d.toLocaleString());
    });

    $('.week-tabs > ul > li').click(function() {
      $('.week-tab').addClass('is-hidden')
      $($(this).data('target')).removeClass('is-hidden')
      $('.week-tabs > ul > li').removeClass('is-active')
      $(this).addClass('is-active')
    })

    now = new Date();
    if (now >= new Date(2024,9,15) && now < new Date(2024,9,22)) {
      $("#week2btn").trigger("click");
    } else if (now >= new Date(2024,9,22) && now < new Date(2024,10,5)) {
      $("#week3btn").trigger("click");
    } else if (now > new Date(2024,10,5)) {
      $("#week4btn").trigger("click");
    }

    $(".navbar-burger").click(function() {
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
    });
    $(".rules-btn").click(function() {
        rulesPage("#"+$(this).data('target'));
    });

    now = new Date();
    var d = Math.round(now.getTime() / 1000);
    console.log(d)
    $('.nowlive').each(function(i,obj) {
        var utcStart = $(obj).data('start');
        var utcEnd = $(obj).data('end');
        if (utcStart <= d && utcEnd >= d) {
            $(obj).removeClass('is-hidden');
        }
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