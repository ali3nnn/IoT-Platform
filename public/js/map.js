// MAP PAGE
// ========================================

// const getZonesAsync = async () => {
//     const result = await getZones()
//     return result
// }

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

// // usage example:
// var a = ['a', 1, 'a', 2, '1'];
// var unique = a.filter( onlyUnique ); // returns ['a', 1, 2, '1']

// County Colors
const countyEnabled = "rgb(52, 58, 64)"
const countyDisabled = "rgb(52, 58, 64, 0.5)"
const countyHover = "rgb(73, 104, 136)"

// Zone List Append
$("#zones-list").ready(function () {

    // Append Loading Spinner Until Zone List Is Fetched
    const loadingItem = `<div class="zone-item zone-item-loading">
                            <a href="#" class='spinner'>
                                <span>Loading...</span>
                            </a>
                        </div>`

    $('#zones-list').append(loadingItem);

    // County Fetch
    const getZones = async () => {
        // const response = await fetch("https://anysensor.dasstec.ro/api/get-zones")
        const response = await fetch("https://anysensor.dasstec.ro/api/get-data")
        return response.json()
    }

    (async () => {

        try {
            var json = await getZones()
        } catch {
            var json = {
                result: []
            }
        }

        // console.log("County fetched:", json[0])

        // let length = json[0].countiesCounter
        let county_list = []

        for (var item = 0; item < json[0].countiesCounter; item++) {
            county_list.push(json[0].counties[item])
        }

        // console.log(county_list)
        // console.log(county_list.filter(onlyUnique))

        county_list = county_list.filter(onlyUnique)

        // Map Change
        // let countyElements = document.querySelectorAll(".romania-svg svg > path");

        // for (var item = 0; item < countyElements.length; item++) {
        //     // Get county name - string format
        //     let county = countyElements[item].getAttribute("name")
        //     // Replace diacritics
        //     county = county.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        //     // Check which county is in zone list
        //     if (county_list.includes(county)) {
        //         // console.log("county:",county)
        //         // Background darker
        //         countyElements[item].setAttribute("fill", countyEnabled)
        //     } else {
        //         // Backgorund lighter
        //         countyElements[item].setAttribute("fill", countyDisabled)
        //     }
        // }

        // HTML Zone Append
        $('#zones-list .zone-item-loading').remove()

        // Add Zones List
        if (json[0].countiesCounter == 0) {
            const htmlRes = `<div class="zone-item">
                                <a href="#" class='no-zone'><i class="fas fa-lock"></i><span>No zone for you</span></a>
                            </div>`
            $('#zones-list').append(htmlRes);
        } else {

            for (var countyIndex=0; countyIndex<county_list.length; countyIndex++) {
                var countyName = county_list[countyIndex]
                var htmlRes = `<div class="zone-item">
                                    <a href="/map/${countyName}" county="${countyName}" class="county-item"><i class="fas fa-map-marker-alt"></i><span>${countyName}</span></a>
                                </div>`
                // insert a css class to zone selected if any
                if (window.location.href.indexOf(countyName) > -1) {
                    htmlRes = `<div class="zone-item zone-item-selected">
                        <a href="/map/${countyName}" county="${countyName}" class="county-item"><i class="fas fa-map-marker-alt"></i><span>${countyName}</span></a>
                    </div>`
                } 

                // Append county in #zone-list
                $('#zones-list').append(htmlRes);

                // Add unqiue class to body based on sensorName selected
                const bodyClass = `${countyName}-dashboard`
                $("body").addClass(bodyClass)
            }

            $("body").addClass("zone-item-loaded")

            // hoverZoneItem()

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