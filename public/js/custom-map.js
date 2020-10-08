import {
    timeoutAsync,
} from './utils.js'

// $(document).tooltip();

// Set the background
$("#custom-map").append(`<img src="images/custommap_`+username+`.jpg"></img>`)

let getElementsForCustomMap = async () => {
    let response = await fetch("/api/mysql?q=select * from custommap_" + username)
    return response.json()
}

let main = (async () => {
    return await getElementsForCustomMap()
    // console.log(usersTable)
})().then(response => {
    // console.log(response[0])
    for (const item of response) {
        console.log(item)
        if (item.users != null) {
            $("#custom-map").append(`
            <div id="draggable-` + item.sensors + `" sensor="` + item.sensors + `" class="draggable ui-widget-content" data-toggle="tooltip" data-placement="top"  title="` + item.sensors + `">
                <span>` + item.sensors + `</span>    
                <i class="fas fa-refrigerator "></i>
            </div>`)

            // item.x < 0 ? item.x = 0 : item.x
            // item.y < 0 ? item.y = 0 : item.y

            const position = {
                left: item.x || 0,
                top: item.y || 0
            }

            console.log(position)

            $("#map").prepend(`<p>`+position.left+` `+position.top+`</p>`)

            $(`#draggable-` + item.sensors).draggable({
                grid: [20, 20],
                create: function (event, ui) {
                    $(this).position({
                        my: "left+" + position.left + ", top+" + position.top,
                        at: "left top",
                        of: $(this).parent()
                    });
                    // console.log("create", )
                },
                start: function (event, ui) {
                    console.log("start", ui.position)
                },
                drag: function (event, ui) {
                    console.log("drag", ui.position)
                    // Keep the left edge of the element
                    // at least 100 pixels from the container
                    // ui.position.left = Math.min( 100, ui.position.left );
                },
                stop: function (event, ui) {
                    const sensorId = $(this).attr('sensor')
                    console.log("UPDATE customap_" + username + " SET x='" + ui.position.left + "', y='" + ui.position.top + "' WHERE sensors='" + sensorId + "';")
                    fetch("/api/mysql?q=UPDATE custommap_" + username + " SET x='" + ui.position.left + "', y='" + ui.position.top + "' WHERE sensors='" + sensorId + "';")
                },
            });
        }

    }
})
// getElementsForCustomMap(username)

function up() {
    
    console.log( $("#custom-map > div").position() )

    // $("#custom-map > div").position({
    //     my: "left+" + position.left + ", top+" + position.top,
    //     at: "left top",
    //     of: $(this).parent()
    // });
    
}