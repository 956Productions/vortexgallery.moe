function rulesPage(t) {
    if ( t != '' ) {
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
        rulesPage("#"+$(this).data('target'))
    });
    window.addEventListener('hashchange', rulesPage(location.hash));
});