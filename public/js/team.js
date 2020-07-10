// get users from mysql
let getUsers = async () => {
    let response = await fetch("https://anysensor.dasstec.ro/api/get-users")
    return response.json()
}

// get zones assigned to each user
let getZones = async (username) => {
    let response = await fetch("https://anysensor.dasstec.ro/api/sensors-access?username=" + username)
    return response.json()
}

let main = (async () => {
    usersTable = await getUsers()
})().then(async () => {

    // console.log(usersTable[0])
    const rows = usersTable[0].length

    for (var i = 0; i < rows; i++) {

        (async () => {

            $("body").append(`
            <div class="modal fade modal-` + usersTable[0][i].Username + `" tabindex="-1" aria-hidden="true" role="dialog" data-backdrop="static" data-keyboard="false">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id='modelTitle'>Edit user: ` + usersTable[0][i].Username + `</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="form-group">
                                <label for="exampleFormControlInput1">Email address</label>
                                <input type="email" class="form-control" id="exampleFormControlInput1" placeholder="name@example.com">
                            </div>
                            <div class="form-group">
                                <label for="exampleFormControlSelect1">Example select</label>
                                <select class="form-control" id="exampleFormControlSelect1">
                                    <option>1</option>
                                    <option>2</option>
                                    <option>3</option>
                                    <option>4</option>
                                    <option>5</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="exampleFormControlSelect2">Example multiple select</label>
                                <select multiple class="form-control" id="exampleFormControlSelect2">
                                    <option>1</option>
                                    <option>2</option>
                                    <option>3</option>
                                    <option>4</option>
                                    <option>5</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="exampleFormControlTextarea1">Example textarea</label>
                                <textarea class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary">Save changes</button>
                    </div>
                    </div>
                </div>
            </div>
            `)

            $(".team-container tbody").append(`
                <tr>
                    <td class="user-col">` +
                usersTable[0][i].Name + `<br>` +
                usersTable[0][i].Username + `<br>` +
                usersTable[0][i].Email + `<br>` +
                `</td>
                    <td class="zones-col zones-` + usersTable[0][i].Username + `">
                        <a href="#" class='spinner ` + usersTable[0][i].Username + `-zone-spinner'>
                            <span>Loading...</span>
                        </a>
                    </td>
                    <td class="actions-col">
                        <button type="button" class="btn btn-outline-primary edit-user" data-toggle="modal" data-target=".modal-` + usersTable[0][i].Username + `">
                            <i class="fal fa-edit"></i>
                            <span>Edit User</span>
                        </button>
                        <button type="button" class="btn btn-danger remove-user">
                            <i class="fal fa-user-minus"></i>
                            <span>Remove User</span>
                        </button>
                    </td>
                </tr>
            `)

            zonesTable = await getZones(usersTable[0][i].Username)

        })().then(result => {
            zonesTable.forEach(element => {

                turnOnClick(element.query)

                $(".team-container ." + element.query + "-zone-spinner").remove()

                if (element.error)
                    $(".team-container .zones-" + element.query).append(`<span class="no-zone">` + element.error + `</span>`)
                else
                    $(".team-container .zones-" + element.query).append(`<span class="zone" belongsTo="` + element.belongsTo + `">` + element.zone + `</span>`)
            })

        })

    }

})



function turnOnClick(user) {

    

    // callback when modal shows
    $('.modal-' + user + '').on('shown.bs.modal', function (e) {
        console.log("shown")

        // $(".main-overlay").addClass("force-show-overlay")
        // $('#main').addClass("blur4")
        // $('#mySidenav').addClass("blur4")
    })

    // callback when modal hides
    $('.modal-' + user + '').on('hide.bs.modal', function (e) {
        console.log("hide")
        // $(".main-overlay").removeClass("force-show-overlay")
        // $('#main').removeClass("blur4")
        // $('#mySidenav').removeClass("blur4")
    })

}