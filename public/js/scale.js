console.log("scale.js")

let getScaleRecordings = async () => {
    let response = await fetch("http://89.39.209.2:5000/api/get-scale-recordings")
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