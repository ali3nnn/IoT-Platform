// Imports
import {
  sendMessage,
  liveWeightTable,
  scaleInput,
  filterColumn
} from './utils.js'

// Fetch
let sendScaleRecordings = async (barcode, weight, wms = 0) => {
  console.log(barcode, weight)
  let response = await fetch("https://anysensor.dasstec.ro/api/send-scale-recordings?barcode='" + barcode + "'&weight='" + weight + "'&wms='" + wms + "'")
  return response.json()
}

let getScaleRecordings = async () => {
  let response = await fetch("https://anysensor.dasstec.ro/api/get-scale-recordings")
  return response.json()
}

// if ($(".scale-page").length) {

// console.log("scale.js added")

// Filter on keyup
$("#scaleInput").keyup(function () {
  filterColumn('scaleInput','scaleTable',1)
});

// The client listens on Socket.IO 
socket.on('socketChannel', (data) => {

  // Live Weight - client receives scale data from backend
  if (data.topic.includes(username + "/scale")) {
    liveWeightTable(data.message, 1)
  }

})

// Main
let run = (async () => {
  return await getScaleRecordings();
})().then((json) => {
  if (json.length) {
    var tbody = $(".table-wrapper table tbody")
    for (var [key, value] of Object.entries(json)) {

      var date = new Date(value.timestamp)
      date.setHours(date.getHours() - 2); //mysql is 2 hours ahead of romanian timezone
      value.timestamp = date.toLocaleString('en-US', {
        timeZone: 'Europe/Bucharest',
        timeStyle: "medium",
        dateStyle: "long"
      })

      tbody.prepend(`<tr timestamp="` + value.timestamp + `" barcode="` + value.barcode + `">
                        <th scope="row">` + (parseInt(key) + 1) + `</th>
                        <td>` + value.wms + `</td>
                        <td>` + value.barcode + `</td>
                        <td>` + value.value + `g</td>
                        <td>` + value.timestamp.split(", ")[0] + `, ` + value.timestamp.split(", ")[1] + `</td>
                    </tr>`)
    }
  } else {
    $(".table-wrapper").append(`<p class="text-center">No recordings</p>`)
  }
})


// }