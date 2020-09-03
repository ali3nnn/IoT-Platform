// socket.on('mqtt', (data) => {
//   console.log('mqtt', data)
// })

// The client listens on Socket.IO 
socket.on('socketChannel', (data) => {

  // Live Weight - client receives scale data from backend
  if(data.topic.includes(username+"/scale")) {
      // console.log("live weight:",data.message.weight,data.message.barcode)
      liveWeight(data.message)

      // Sen acknowledge message to server
      // sendMessage("socketChannel",{
      //     topic: 'ack',
      //     message: "I am "+username+"! I updated live weight!"
      // })
  }

})

function sendMessage(topic, msg) {
  // send a status message to get the gate status
  socket.emit(topic, msg)
}

function liveWeight(payloadJson) {
  var scaleTitle = $(".scale-info h3")
  var barcodeTitle = $(".scale-info p")
  // var payloadJson = JSON.parse(message.payloadString)
  scaleTitle.html(payloadJson.weight + "g")
  barcodeTitle.html(payloadJson.barcode)
}

let getScaleRecordings = async () => {
    let response = await fetch("https://anysensor.dasstec.ro/api/get-scale-recordings")
    return response.json()
}

let run = (async () => {
    json = await getScaleRecordings();
})().then(() => {
    var tbody = $(".table-wrapper table tbody")
    for (var [key, value] of Object.entries(json)) {
        tbody.append(`<tr timestamp="`+value.timestamp+`" barcode="`+value.barcode+`">
                        <th scope="row">` + (parseInt(key) + 1) + `</th>
                        <td>` + value.scaleId + `</td>
                        <td>` + value.barcode + `</td>
                        <td>` + value.value + `g</td>
                        <td>` + value.timestamp.split("T")[0] + ` at ` + value.timestamp.split("T")[1].split(".")[0] + `</td>
                    </tr>`)
    }

})

function scaleInput() {
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("scaleInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("scaleTable");
    tr = table.getElementsByTagName("tr");
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[1];
    //   console.log(i, td)
      if (td) {
        txtValue = td.textContent || td.innerText;
        // console.log(i, td, txtValue)
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }