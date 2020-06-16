// MAP PAGE
// ========================================

// const getZonesAsync = async () => {
//     const result = await getZones()
//     return result
// }

// County Colors
const countyEnabled = "rgb(52, 58, 64)"
const countyDisabled = "rgb(52, 58, 64, 0.5)"
const countyHover = "rgb(73, 104, 136)"

// Zone List Append
$("#zones-list").ready(function () {

    // County Fetch
    const getZones = async () => {
        const response = await fetch("https://anysensor.dasstec.ro/api/get-zones")
        return response.json()
    }

    (async () => {

        try {
            var json = await getZones()
        } catch {
            var json = {result: []}
        }
        // console.log("County fetched:", json.result)

        let length = json.result.length
        let county_list = []

        for (var item = 0; item < length; item++) {
            county_list.push(json.result[item].county)
        }

        // console.log(county_list)

        // Map Change
        let countyElements = document.querySelectorAll(".romania-svg svg > path");

        for (var item = 0; item < countyElements.length; item++) {
            // Get county name - string format
            let county = countyElements[item].getAttribute("name")
            // Replace diacritics
            county = county.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            // Check which county is in zone list
            if (county_list.includes(county)) {
                // console.log("county:",county)
                // Background darker
                countyElements[item].setAttribute("fill", countyEnabled)
            } else {
                // Backgorund lighter
                countyElements[item].setAttribute("fill", countyDisabled)
            }
        }

        // HTML Zone Append
        $('#zones-list .zone-item-loading').remove()

        if (length == 0) {
            const htmlRes = `<div class="zone-item">
                                <a href="#" class='no-zone'><i class="fas fa-lock"></i><span>No zone for you</span></a>
                            </div>`
            $('#zones-list').append(htmlRes);
        } else {
            for (var zone = 0; zone < length; zone++) {
                const htmlRes = `<div class="zone-item">
                    <a href="/map/${json.result[zone].county}" county="${json.result[zone].county}" class="county-item"><i class="fas fa-map-marker-alt"></i><span>${json.result[zone].sensorName}</span></a>
                </div>`
                $('#zones-list').append(htmlRes);
            }
            $("body").addClass("zone-item-loaded")

            hoverZoneItem()

        }

    })()
});

// SVG MAP
$(".romania-svg").ready(function () {

    try {
        $(".romania-svg svg > path").attr("stroke-width", "1")
        $("body").addClass("svg-map-loaded")

    } catch (e) {
        console.warn("This page does not contain the svg map")
    }

});



function hoverZoneItem() {

    let oldCountyColor
    let mapCounty
    let countyName
    let zoneItem

    // Change background of county when hover over zone list
    $(".zone-item a.county-item").hover(function (event) {
        countyName = event.currentTarget.attributes.county.value
        mapCounty = $("[name=" + countyName + "]")
        // console.log("mapCounty:",mapCounty)
        oldCountyColor = mapCounty.attr('fill')
        mapCounty.attr("fill", countyHover)
        // console.log(countyName,mapCounty)
    }, function () {
        mapCounty.attr("fill", oldCountyColor)
    });

    // Change background of county and zone list item when hover over map
    $(".romania-svg svg > path").hover(function (event) {
        oldCountyColor = $(this).attr('fill')
        $(this).attr("fill", countyHover)
        // countyName = $(event.target).attr('name')
        // zoneItem = $("[county='" + countyName + "']")
        // zoneItem.addClass("hovered-county")
    }, function () {
        $(this).attr("fill", oldCountyColor)
        // zoneItem.removeClass("hovered-county")
    });

}


// Click on map and redirect to county's dashboard
// $(".romania-svg svg > path").click(function () {
//     let county = $(this).attr('name')

//     let countyZones = document.querySelectorAll(".county-item span")
//     // console.log(countyZones)
//     let countyZonesList = []
//     for (var i = 0; i < countyZones.length; i++) {
//         // console.log(countyZones[i].innerHTML)
//         countyZonesList.push(countyZones[i].innerHTML)
//     }
//     // console.log(countyZonesList, countyZonesList.includes(county))

//     if (countyZonesList.includes(county)) {
//         window.location.href += '/'+county
//     } else {
//         console.log("selected county is not in your user's list")
//     }

// })

// ========================================
// END MAP PAGE