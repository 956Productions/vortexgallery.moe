$(function() {
    next_event_template = 
`<div class="block"> <!-- Schedule Blocks -->
<div class="box stream-box" style="height: 100%;">
    <div class="columns is-vcentered">
        <div class="column is-one-fifth is-flex is-flex-direction-column is-justify-content-center" style="height: 15vh;">
            <figure class="image is-hidden gameLogo is-flex is-justify-content-center">
                <img style="image-rendering: optimizequality; max-height: 12vh; width: auto;" src="$logo">
            </figure>
        </div>
        <div class="column">
            <h1 class="exo title is-1 mb-4 shadowed-text">$name ($region)</h1>
            <span class="icon-text is-size-3">
                <span class="icon has-text-white">
                    <i class="fas fa-home"></i>
                </span>
                <span><h1 class="ml-2 exo has-text-white shadowed-text">/$channel</h1></span>
            </span>
            <span class="ml-4 icon-text is-size-3">
                <span class="icon has-text-white">
                    <i class="fas fa-home"></i>
                </span>
                <span><h1 class="ml-2 exo has-text-white shadowed-text">$time</h1></span>
            </span>
        </div>
    </div>
</div>
</div>`

    later_event_template = 
`<div class="block page-1 fade-in-stream">
<div class="box stream-box has-text-centered" style="height: 100%;">
    <div class="columns is-vcentered">
    <div class="column">
    <div class="columns is-gapless is-vcentered" style="height: 12vh;">
        <div class="column">
            <figure class="image is-hidden gameLogo is-flex is-justify-content-center">
                <img style="image-rendering: optimizequality; max-height: 12vh; width: auto;" src="$logo">
            </figure>
        </div>
        <div class="column">
            <h1 class="exo title is-3 mb-2 shadowed-text">$region</h1>
            <h1 class="exo is-size-4 has-text-white shadowed-text">$time</h1>
        </div>
    </div>
    <span class="icon-text is-size-3">
        <span class="icon has-text-white">
            <i class="fas fa-home"></i>
        </span>
        <span><h1 class="ml-2 exo has-text-white shadowed-text">/$channel</h1></span>
    </span>
    </div>
    </div>
</div>
</div>`

later_scroll_event_template = 
`<div class="block page-2 is-hidden">
<div class="box stream-box has-text-centered" style="height: 100%;">
    <div class="columns is-vcentered">
    <div class="column">
    <div class="columns is-gapless is-vcentered" style="height: 12vh;">
        <div class="column">
            <figure class="image is-hidden gameLogo is-flex is-justify-content-center">
                <img style="image-rendering: optimizequality; max-height: 12vh; width: auto;" src="$logo">
            </figure>
        </div>
        <div class="column">
            <h1 class="exo title is-3 mb-2 shadowed-text">$region</h1>
            <h1 class="exo is-size-4 has-text-white shadowed-text">$time</h1>
        </div>
    </div>
    <span class="icon-text is-size-3">
        <span class="icon has-text-white">
            <i class="fas fa-home"></i>
        </span>
        <span><h1 class="ml-2 exo has-text-white shadowed-text">/$channel</h1></span>
    </span>
    </div>
    </div>
</div>
</div>`

    $.getJSON ('stream_schedule.json', function ( json ) {
        nextGames = Object.values(json).slice(0,3)
        laterGames = Object.values(json).slice(3,7)
        laterScrollGames = Object.values(json).slice(7,11)
        console.log(nextGames)
        console.log(laterGames)
        console.log(laterScrollGames)


        for (var i = 2; i > -1; i--) {
            event_element = next_event_template
            event_element = event_element.replace("$name",nextGames[i].name)
            event_element = event_element.replace("$channel",nextGames[i].channel)
            event_element = event_element.replace("$logo",nextGames[i].logo)
            event_element = event_element.replace("$region",nextGames[i].region)
            $('.schedule-now-header').after(event_element)
        }

        for (var i = 3; i > -1; i--) {
            event_element = later_event_template
            event_element = event_element.replace("$name",laterGames[i].name)
            event_element = event_element.replace("$channel",laterGames[i].channel)
            event_element = event_element.replace("$logo",laterGames[i].logo)
            event_element = event_element.replace("$region",laterGames[i].region)
            $('.schedule-later-header').after(event_element)
        }

        for (var i = 3; i > -1; i--) {
            event_element = later_scroll_event_template
            event_element = event_element.replace("$name",laterScrollGames[i].name)
            event_element = event_element.replace("$channel",laterScrollGames[i].channel)
            event_element = event_element.replace("$logo",laterScrollGames[i].logo)
            event_element = event_element.replace("$region",laterScrollGames[i].region)
            $('.schedule-later-header').after(event_element)
        }

        var page = 1
        window.setInterval(function(){
            if (page == 1) {
                $('.page-1').removeClass('fade-in-stream')
                $('.page-1').addClass('fade-out-stream')
                window.setTimeout(function() {
                    $('.page-1').addClass('is-hidden')
                    $('.page-2').removeClass('is-hidden')
                    $('.page-2').addClass('fade-in-stream')
                    page = 2
                }, 1100)
            } else {
                $('.page-2').removeClass('fade-in-stream')
                $('.page-2').addClass('fade-out-stream')
                window.setTimeout(function() {
                    $('.page-2').addClass('is-hidden')
                    $('.page-1').removeClass('is-hidden')
                    $('.page-1').addClass('fade-in-stream')
                    page = 1
                }, 1100)
            }
        }, 5000)
    })

    window.setInterval(function(){
        $('img').imagesLoaded()
        .done( function() {
            $('.gameLogo').removeClass('is-hidden')
            $('.gameLogo').addClass('fade-in-stream')
            $('.container-fluid').removeClass('is-hidden')
            $('.container-fluid').addClass('fade-in-stream')
        })
    },200)
})
  