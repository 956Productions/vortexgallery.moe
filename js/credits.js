$(function() {
    $.getJSON ('https://ninefivesix-aigis.onrender.com/staff', function ( json ) {
        console.log(json)

        gsap.to('#credits', {y: $(window).height(),duration:0})
        
        for (i = 0; i < json['956 Productions'].length; i++) {
            cur = json['956 Productions'][i]
            var e = $(`<p><b>${cur[0]}</b> (${cur[1]})</p>`)
            $('#956credits').append(e)
        }

        for (i = 0; i < json['Vortex Gallery Online 2023 Staff'].length; i++) {
            cur = json['Vortex Gallery Online 2023 Staff'][i]
            if (cur[1] !== null) {
                var e = $(`<p><b>${cur[0]}</b> (${cur[1]})</p>`)
                $('#staffcredits').append(e)
            } else {
                var e = $(`<p><b>${cur[0]}</b></p>`)
                $('#staffcredits').append(e)
            }
        } 

        for (i = 0; i < json['Special Thanks'].length; i++) {
            cur = json['Special Thanks'][i]
            var e = $(`<p><b>${cur}</b></p>`)
            $('#thankscredits').append(e)
        }

        gsap.to('#credits', {y: $('#credits').height() * -1, duration: $('#credits').height() / 30 })
        console.log($('#credits').height() / 30)
    })  
})
  