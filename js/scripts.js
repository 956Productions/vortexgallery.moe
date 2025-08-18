function rulesPage(t) {
    if ( t != '' && t != '#' ) {
        $(".rules-btn").toggleClass('is-active', false);
        $("#btn-"+t.replace("#","")).toggleClass('is-active',true);
        $(".rules-div").toggleClass('is-hidden', true);
        $(t).toggleClass('is-hidden',false);
        history.pushState(null,null,t);
    }
}

function expireStreams() {
  now = new Date();
  var d = Math.round(now.getTime() / 1000);
  $('.stream-entry').each(function(i,obj) {
      var utcEnd = $(obj).data('end');
      if (utcEnd < d) {
          $(obj).addClass('is-hidden');
      }
  });
}

function markLiveStreams() {
  expireStreams();
  now = new Date();
  var d = Math.round(now.getTime() / 1000);
  $('.nowlive').each(function(i,obj) {
      var utcStart = $(obj).data('start');
      var utcEnd = $(obj).data('end');
      if (utcStart <= d && utcEnd + 3600 >= d) {
        $(obj).removeClass('is-hidden');
      } else {
        $(obj).addClass('is-hidden');
      }
  });
}

function selectFirstActiveStream() {
  $('.stream-entry').each(function(i,obj) {
    if ($(obj).hasClass('is-hidden') == false && $(obj).data("target").includes('youtube') == false) {
      username = $(obj).data("target").split("/").at(-1)
      $("#chat_embed").attr('src',"https://www.twitch.tv/embed/" + username + "/chat?darkpopout&parent=vortexgallery.moe")
      $("#twitch-player").attr('src',"https://player.twitch.tv/?channel=" + username + "&parent=vortexgallery.moe")
      return false; //breaks
    }
  });
}

$(document).ready(function() {
    $("#schedule_list").css({'height':($("#twitch-player").height()+"px")});
    expireStreams();
    selectFirstActiveStream();
    setInterval(markLiveStreams,5000);

    $.get(window.location.origin + '/js/quotes.txt', function(txt) {
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

    $('.short-timestamp-text').each(function(i,obj) {
      var utcSeconds = $(obj).data('time');
      var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
      d.setUTCSeconds(utcSeconds);
      $(obj).text(d.toLocaleString(undefined,{dateStyle:"short",timeStyle:"short"}));
    });

    $(".navbar-burger").click(function() {
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
    });

    $(".rules-btn").click(function() {
        rulesPage("#"+$(this).data('target'));
    });

    $("#schedule-tab").click(function() {
      $("#schedule-tab").addClass("is-active");
      $("#chat-tab").removeClass("is-active");
      $("#schedule_list").removeClass("is-hidden")
      $("#chat_embed").addClass("is-hidden")
      $("#player-container").removeClass("is-align-items-stretch")
    });

    $("#chat-tab").click(function() {
      $("#schedule-tab").removeClass("is-active");
      $("#chat-tab").addClass("is-active");
      $("#schedule_list").addClass("is-hidden")
      $("#chat_embed").removeClass("is-hidden")
      $("#player-container").addClass("is-align-items-stretch")
    });

    $(window).on('resize', function() {
      $("#schedule_list").css({'height':($("#twitch-player").height()+"px")});
    });

    $(".stream-trigger").click(function() {
      if ($(this).data("target").includes('youtube') == true) {
        window.open($(this).data("target"), '_blank');
        //$("#chat-tab").addClass("is-hidden");
        //$("#chat-tab").removeClass("is-active");
        //$("#schedule-tab").addClass("is-active");
        //$("chat_embed").addClass("is-hidden");
        //$("#schedule_list").removeClass("is-hidden");
        //$("#twitch-player").attr('src',"https://www.youtube.com/embed/live_stream?channel=" + $(this).data("ytid"))
      } else {
        username = $(this).data("target").split("/").at(-1)
        $("#chat_embed").attr('src',"https://www.twitch.tv/embed/" + username + "/chat?darkpopout&parent=vortexgallery.moe")
        $("#twitch-player").attr('src',"https://player.twitch.tv/?channel=" + username + "&parent=vortexgallery.moe")
        //$("#chat-tab").removeClass("is-hidden");
      }
    });

    now = new Date();
    var d = Math.round(now.getTime() / 1000);
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