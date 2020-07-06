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

var time = new Date()

// Zone List Append
$("#zones-list").ready(function () {

    // console.log("#zone-list is ready",new Date() - time)

    // Append Loading Spinner Until Zone List Is Fetched
    const loadingItem = `<div class="zone-item zone-item-loading">
                            <a href="#" class='spinner'>
                                <span>Loading...</span>
                            </a>
                        </div>`

    $('#zones-list').append(loadingItem);

    // console.log("loading append is ready",new Date() - time)

    // County Fetch
    const getZones = async () => {
        // const response = await fetch("https://anysensor.dasstec.ro/api/get-zones")
        const response = await fetch("https://anysensor.dasstec.ro/api/get-data")
        return response.json()
    }

    (async () => {

        var json = {
            result: []
        }

        try {
            var json = await getZones()
        } catch {
            var json = {
                result: []
            }
        }

        // HTML Zone Append
        $('#zones-list .zone-item-loading').remove()

        // console.log(json[0].error)


        // Add Zones List
        if (json[0].error) {
            const htmlRes = `<div class="zone-item">
                                <a href="#" class='no-zone'><i class="fas fa-lock"></i><span>No zone for you</span></a>
                            </div>`
            $('#zones-list').append(htmlRes);
        } else {

            let county_list = []

            for (var item = 0; item < json[0].countiesCounter; item++) {
                county_list.push(json[0].counties[item])
            }

            county_list = county_list.filter(onlyUnique)

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

            var infos = () => {
                var brandH = $("#mySidenav .brand").height();
                var basicItemsCounter = $("#mySidenav .basic-items").length;
                var basicItemsH = $("#mySidenav .basic-items").height();
                var zoneLisH = $("#mySidenav #zones-list").height();
                var settingItemsH = $("#mySidenav .settings-items").height();
                // console.log(brandH,basicItemsCounter,basicItemsH,zoneLisH,settingItemsH)
                var minSidenavH = brandH + basicItemsCounter*basicItemsH + zoneLisH + settingItemsH + 10
                $("#mySidenav").css("min-height",minSidenavH)
            }
    
            infos()

        }

        // console.log("done",new Date() - time)

        

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