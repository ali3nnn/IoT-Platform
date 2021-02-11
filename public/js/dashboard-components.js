const humanizeDuration = require("humanize-duration");

export let currentValueView = (alertClass2, sensor) => `
<article class="card height-control ` + alertClass2 + ` live-card-` + sensor.sensorMeta.sensorId + `" sensorId="` + sensor.sensorMeta.sensorId + `" sensortype="` + sensor.sensorMeta.sensorType + `" battery="` + sensor.sensorMeta.battery + `">

    <div class="card-header">
        <h3 class="card-title">
            <i class='update-icon'></i>
            Current Value
        </h3>
        <span class='card-settings-button'>
            <i class="far fa-sliders-h"></i>
        </span>
    </div>

    <div class="card-body">
       <div class="` + sensor.sensorMeta.sensorId + `-currentValue">
            <div id="` + sensor.sensorMeta.sensorId + `-gauge" class="gauge-container two">
                <span class="currentValue">0</span>
                ` + (() => {
        return ![null, 'NaN', undefined, ''].includes(sensor.sensorMeta.min) ? '<span class=\'minAlertGauge\' value=\' ' + sensor.sensorMeta.min + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>min: ' + sensor.sensorMeta.min + '</span> ' : '<span class=\'minAlertGauge noAlertGauge\' value=\' ' + sensor.sensorMeta.min + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>No min alert</span> '
    })() + `
                ` + (() => {
        return ![null, 'NaN', undefined, ''].includes(sensor.sensorMeta.max) ? '<span class=\'maxAlertGauge\' value=\' ' + sensor.sensorMeta.max + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>max: ' + sensor.sensorMeta.max + '</span> ' : '<span class=\'maxAlertGauge noAlertGauge\' value=\' ' + sensor.sensorMeta.max + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>No max alert</span> '
    })() + `
            </div>
            <p class='update-time-gauge'><span class="not-live pulse"></span><span class="time">Waiting to be updated...</span></p>
        </div>
    </div>

    <div class='card-alerts-settings alert-` + sensor.sensorMeta.sensorId + `'>
        <span class='card-settings-button-alert tooltip_test'>
            <i class="fas fa-bell"></i>
            <span class="tooltiptext">New feature is coming!</span>
        </span>
        <span class='card-settings-button-update tooltip_test'>
            <i class="fas fa-save"></i>
            <span class="tooltiptext">By clicking you will update alerts and location!</span>
        </span>
        <span class='card-settings-button-inner'>
            <i class="far fa-sliders-h"></i>
        </span>
        <div class='settings-wrapper'>
            <div class="slidecontainer">

                <p class='label-input'>Min: </p>
                <input type="number" name="minAlert" ` + (() => {
        return sensor.sensorMeta.min ? 'value="' + sensor.sensorMeta.min + '"' : 'placeholder="Set min alert"'
    })() + ` class="input input-min">
                <p class='label-input'>Max: </p>
                <input type="number" name="maxAlert" ` + (() => {
        return sensor.sensorMeta.max ? 'value="' + sensor.sensorMeta.max + '"' : 'placeholder="Set max alert"'
    })() + ` class="input input-max">
                <p class='label-input'>Lat: </p>
                <input type="number" name="xLat" ` + (() => {
        return sensor.sensorMeta.x ? 'value="' + sensor.sensorMeta.x + '"' : 'placeholder="Set x position"'
    })() + ` class="input input-lat">
                <p class='label-input'>Long: </p>
                <input type="number" name="yLong" ` + (() => {
        return sensor.sensorMeta.y ? 'value="' + sensor.sensorMeta.y + '"' : 'placeholder="Set y position"'
    })() + ` class="input input-long">

            </div>
        </div>
    </div>
</article>
`

export let graphView = (sensor, sensorData) => `

<article class="card height-control ` + sensor.sensorMeta.sensorId + `-card graph-` + sensor.sensorMeta.sensorId + `" sensorType="` + sensor.sensorMeta.sensorType + `" sensorId="` + sensor.sensorMeta.sensorId + `" sensorData='` + sensorData + `'>

    <div class="card-header">

        <h3 class="card-title">
            <i class='update-icon'></i>
            <div class='edit-sensor-name'><i class="far fa-edit"></i></div>
            <span>` + sensor.sensorMeta.sensorName + `</span> |
            <b>` + sensor.sensorMeta.sensorId + `</b>
        </h3>

        <div class="card-tools">
            <ul class="pagination pagination-sm">

                <li class="page-item">
                    <div id="reportrange" style="background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%">
                        <i class="fa fa-calendar"></i>&nbsp;
                        <span></span> <i class="fa fa-caret-down"></i>
                    </div>
                </li>

                <li class="page-item">
                    <div id="report" class="tooltip_test" style="background: #fff; cursor: pointer; padding: 5px 10px; border: 1px solid #ccc; width: 100%">
                        <i class="fas fa-file-csv"></i>
                        <span class="tooltiptext">Download CSV</span>
                    </div>
                </li>

            </ul>
        </div>

    </div>
    

    <div class="card-body">
        <a href="#" class='spinner ` + sensor.sensorMeta.sensorId + `-graph-spinner'>
            <span>Loading...</span>
        </a> 
        <div class="` + sensor.sensorMeta.sensorId + `-graph-calendar graph-calendar">
            Time interval for ` + sensor.sensorMeta.sensorId + ` 
            <input name="dates" value="Button Change"> 
        </div> 
    </div>
    
</article>`

export let doorLive = (alertClass2, sensor) => `
<article class="card height-control ` + alertClass2 + ` live-card-` + sensor.sensorMeta.sensorId + `" sensorId="` + sensor.sensorMeta.sensorId + `" sensortype="` + sensor.sensorMeta.sensorType + `" battery="` + sensor.sensorMeta.battery + `">

    <div class="card-header">
        <h3 class="card-title">
            <i class='update-icon'></i>
            Door live
        </h3>
        <span class='card-settings-button'>
            <i class="far fa-sliders-h"></i>
        </span>
    </div>

    <div class="card-body">
       <div class="` + sensor.sensorMeta.sensorId + `-currentValue">
            <div id="` + sensor.sensorMeta.sensorId + `-gauge" class="gauge-container two">
                <span class="doorState" state="unknown">
                    <i class="fas fa-door-closed"></i>
                    <i class="fas fa-door-open"></i>
                </span>
                ` + (() => {
        return ![null, 'NaN', undefined, 0, '0', ''].includes(sensor.sensorMeta.openTimer) ? '<span class=\'openTimer\' value=\' ' + sensor.sensorMeta.openTimer + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>open: ' + sensor.sensorMeta.openTimer + '</span> ' : '<span class=\'openTimer noAlertGauge\' value=\' ' + sensor.sensorMeta.openTimer + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>open: <i class="fas fa-infinity"></i></span> '
    })() + `
                ` + (() => {
        return ![null, 'NaN', undefined, 0, '0', ''].includes(sensor.sensorMeta.closedTimer) ? '<span class=\'closedTimer\' value=\' ' + sensor.sensorMeta.closedTimer + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>closed: ' + sensor.sensorMeta.closedTimer + '</span> ' : '<span class=\'closedTimer noAlertGauge\' value=\' ' + sensor.sensorMeta.closedTimer + ' \' sensortype=\' ' + sensor.sensorMeta.sensorType + ' \'>closed: <i class="fas fa-infinity"></i></span> '
    })() + `
            </div>
            <p class='update-time-gauge'><span class="not-live pulse"></span><span class="time">Waiting to be updated...</span></p>
        </div>
    </div>

    <div class='card-alerts-settings alert-` + sensor.sensorMeta.sensorId + `'>
        <span class='card-settings-button-alert tooltip_test'>
            <i class="fas fa-bell"></i>
            <span class="tooltiptext">New feature is coming!</span>
        </span>
        <span class='card-settings-button-update tooltip_test'>
            <i class="fas fa-save"></i>
            <span class="tooltiptext">By clicking you will update alerts and location!</span>
        </span>
        <span class='card-settings-button-inner'>
            <i class="far fa-sliders-h"></i>
        </span>
        <div class='settings-wrapper'>
            <div class="slidecontainer">

                <p class='label-input'>Open:</p>
                <input type="number" name="openAlert" ` + (() => {
        return sensor.sensorMeta.openTimer ? 'value="' + sensor.sensorMeta.openTimer + '"' : ''
    })() + `placeholder="Set open limit in seconds" class="input input-open">
                <p class='label-input'>Closed:</p>
                <input type="number" name="closedAlert" ` + (() => {
        return sensor.sensorMeta.closedTimer ? 'value="' + sensor.sensorMeta.closedTimer + '"' : ''
    })() + `placeholder="Set closed limit in seconds" class="input input-closed">

            </div>
        </div>
    </div>
</article>
`

export let newItemLive = (sensor) => `
<article class="card height-control live-card-` + sensor.sensorMeta.sensorId + `">

<div class="card-header">
    <h3 class="card-title">
        <i class='update-icon'></i>
        Live Update
    </h3>
</div>

<div class="card-body">
    <div class="` + sensor.sensorMeta.sensorId + `-newItem">

        <a href="#" class='spinner ` + sensor.sensorMeta.sensorId + `-newItem-spinner'>
            <span>Loading...</span>
        </a>

        <div id="` + sensor.sensorMeta.sensorId + `-floatinBall" class="hidden-element"></div>

    </div>
</div>`

export let conveyorLive = (sensor, sensorData) => `
<article class="card height-control live-card-` + sensor.sensorMeta.sensorId + `" sensorId="` + sensor.sensorMeta.sensorId + `" sensortype="` + sensor.sensorMeta.sensorType + `" battery="` + sensor.sensorMeta.battery + `">

    <div class="card-header">
        <h3 class="card-title">
            <i class='update-icon'></i>
            Conveyor Usage
        </h3>
        <span class='card-settings-button'>
            <i class="far fa-sliders-h"></i>
        </span>
    </div>

    <div class="card-body">
        <div class="usage-monitor">
        
        </div>
    </div>

    <div class='card-alerts-settings alert-` + sensor.sensorMeta.sensorId + `'>
        <span class='card-settings-button-alert tooltip_test'>
            <i class="fas fa-bell"></i>
            <span class="tooltiptext">New feature is coming!</span>
        </span>
        <span class='card-settings-button-update tooltip_test'>
            <i class="fas fa-save"></i>
            <span class="tooltiptext">By clicking you will update alerts and location!</span>
        </span>
        <span class='card-settings-button-inner'>
            <i class="far fa-sliders-h"></i>
        </span>
        <div class='settings-wrapper'>

        </div>
    </div>

</article>
`

export let conveyor = (sensor, sensorData) => `
<article class="card height-control ` + sensor.sensorMeta.sensorId + `-card controller-` + sensor.sensorMeta.sensorId + `" sensorType="` + sensor.sensorMeta.sensorType + `" sensorId="` + sensor.sensorMeta.sensorId + `" sensorData='` + sensorData + `'>

    <!--<div class="card-header">
        <h3 class="card-title">
            <i class='update-icon'></i>
            <div class='edit-sensor-name'><i class="far fa-edit"></i></div>
            <span>` + sensor.sensorMeta.sensorName + `</span> |
            <b>` + sensor.sensorMeta.sensorId + `</b>
        </h3>
    </div>-->

    <div class="card-body">
        <div class="card-body-inner">
            <div class="state-button">
                <div class="grid-inner">
                    <div status="`+ sensor.sensorMeta.status + `" safety="`+ sensor.sensorMeta.safety + `" class="state-btn-inner ` + (function () {
                        if (sensor.sensorMeta.status == 1 && sensor.sensorMeta.safety == 0)
                            return 'active'  
                        return ''
                    })() + `">
                        <input type="checkbox" class="cb-value" `+(function(){
                            if (sensor.sensorMeta.safety == 1)
                                return 'disabled'  
                            return ''
                        })()+`/>
                        <span class="round-btn"></span>
                    </div>
                    <span class="conveyor-info-title">Status</span>
                    <span class="conveyor-info-message">`+(function(){
                        if (sensor.sensorMeta.status == 1) {
                            if(sensor.sensorMeta.safety == 0)
                                return 'RUN'
                        } else {
                            if(sensor.sensorMeta.safety == 1) {
                                return 'E-STOP'
                            }
                            return 'STOP'
                        }
                    })()+`</span>
                </div>
            </div>
            <div class="last-status">
                    <div class="grid-inner">
                        <i class="fas fa-history"></i>
                        <span class="conveyor-info-title">Ultimul status</span>
                        <span class="conveyor-info-message">`+ (
        function () {

            if (sensor.sensorMeta.statusTime) {
                let h = sensor.sensorMeta.statusTime.split("T")[1].split(":")[0]
                let m = sensor.sensorMeta.statusTime.split("T")[1].split(":")[1]
                let time = sensor.sensorMeta.statusTime.split('T')[1].slice(0,5)
                let day = sensor.sensorMeta.statusTime.split("T")[0].slice(5).split('-')[1]
                let month = sensor.sensorMeta.statusTime.split("T")[0].slice(5).split('-')[0]
                let today = new Date()
                const monthNames = ["","January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                today = today.toLocaleDateString().slice(0,2)
                // console.log(today, day)
                if(today==day) 
                    return time
                return time + " " + day + " " + " " + monthNames[parseInt(month)].slice(0,3)
            }

        })() + `</span>
                    </div>
            </div> 
            <div class="usage-today" seconds="`+ (
        function () {

            let status = sensor.sensorMeta.status
            let safety = sensor.sensorMeta.safety
            let seconds = sensor.sensorMeta.usageToday || 0
            let statusTime, currentTime

            if (parseInt(status) && !parseInt(safety)) {
                statusTime = new Date(sensor.sensorMeta.statusTime) // 2 hours back than current time
                statusTime = new Date(statusTime.getTime() - 2 * 60 * 60 * 1000) // sync hours
                currentTime = new Date() // current time is local time ro
                let diff = parseInt((currentTime - statusTime) / 1000)
                // console.log(seconds, diff)
                seconds += diff - 16
            }
            // console.log({
            //     statusTime,
            //     currentTime,
            //     today: sensor.sensorMeta.usageToday,
            //     status,
            //     safety
            // })
            // console.log("sensor.sensorMeta.usageToday:",sensor.sensorMeta.usageToday, status)

            return seconds
        }
    )() + `">
                <div class="grid-inner">
                    <i class="fas fa-calendar-day"></i>
                    <span class="conveyor-info-title">Folosire astazi</span>
                    <span class="conveyor-info-message">
                    `+ (function () {
        let status = sensor.sensorMeta.status
        let seconds = sensor.sensorMeta.usageToday || 0

        if (parseInt(status)) {
            let statusTime = new Date(sensor.sensorMeta.statusTime) // 2 hours back than current time
            statusTime = new Date(statusTime.getTime() - 2 * 60 * 60 * 1000) // sync hours
            let currentTime = new Date() // current time is local time ro
            let diff = parseInt((currentTime - statusTime) / 1000)
            // console.log(seconds, diff)
            seconds += diff - 16
            // console.log(seconds)
        }

        let result = humanizeDuration(seconds * 1000, {
            language: "en",
            spacer: "",
            // units: ["h", "m", "s"],
            units: ["h", "m"],
            round: true
        })

        result = result.replaceAll("hours", "h")
        result = result.replaceAll("hour", "h")
        result = result.replaceAll("minutes", "m")
        result = result.replaceAll("minute", "m")
        result = result.replaceAll("seconds", "s")
        result = result.replaceAll("second", "s")
        result = result.replaceAll(",", "")

        return result

    })() + `
                    </span>
                </div>
            </div> 
            <div class="usage-total" seconds="`+ (function () { if (sensor.sensorMeta.usageTotal) return sensor.sensorMeta.usageTotal })() + `">
                <div class="grid-inner">
                    <i class="fas fa-clock"></i>
                    <span class="conveyor-info-title">Folosire totala</span>
                    <span class="conveyor-info-message">`+ (function () {
        let seconds = sensor.sensorMeta.usageTotal

        let result = humanizeDuration(seconds * 1000, {
            language: "en",
            spacer: "",
            // units: ["h", "m", "s"],
            units: ["h", "m"],
            round: true
        })

        result = result.replaceAll("hours", "h")
        result = result.replaceAll("hour", "h")
        result = result.replaceAll("minutes", "m")
        result = result.replaceAll("minute", "m")
        result = result.replaceAll(",", "")

        return result

    })() + `</span>
                </div>
            </div> 
            <div class="usage-left">
                <div class="grid-inner">
                    <i class="fas fa-tools"></i>
                    <span class="conveyor-info-title">Mentenanta in</span>
                    <span class="conveyor-info-message">`+ (
        function () {
            if (sensor.sensorMeta.service)
                return sensor.sensorMeta.service + ' s'
            else
                return '<i class="fas fa-infinity"></i>'
        })() + `</span>
                </div>
            </div> 
        </div>
    </div>
    
</article>`

// export let conveyorLayout = (sensor) => `
// <article class="card height-control conveyor-layout ` + sensor.sensorMeta.sensorId + `-card controller-` + sensor.sensorMeta.sensorId + `" sensorType="` + sensor.sensorMeta.sensorType + `" sensorId="` + sensor.sensorMeta.sensorId + `"'>

// </article>`

export let conveyorLayout = (sensor) => `
<div class='conveyor-layout'>
    <div class='conveyor-layout-inner'>
    <!-- TIGANEALA -->
        `+(function(){
            if(username.toLowerCase() == 'pharmafarm') {
                // add an image
                return '<img src="/images/custom-maps/pharmafarm.jpg"/>'
            }
            if(username.toLowerCase() == 'pharmafarm') {
                // add an image
                return '<img src="/images/custom-maps/pharmafarm.jpg"/>'
            }
        })()+`
    <!-- END TIGANEALA -->
    </div>
    `+ newItemsConveyorLayout() + `
</div>`

export let newItemsConveyorLayout = (sensor) => `
<div class='new-items-conveyor'>
    
</div>`

export let conveyorItem = (sensor, draggable, info = { name }) => `
<div name="`+ sensor.sensorName + `" sensor="` + sensor.sensorId + `" type="` + sensor.sensorType + `" state="` + sensor.status + `" class="sensor-item ` + draggable + ` ui-widget-content tooltip_test" data-toggle="tooltip" data-placement="top" title="` + sensor.sensorId + `" ` + (
        function () {
            if (sensor.x && sensor.y)
                return 'style="top: ' + sensor.y + 'px; left: ' + sensor.x + 'px"'
        })() + `>  
  <!-- medium view -->
  <div class='medium-view'>
    `+ null + `
    <span class='sensorName'>`+ sensor.sensorName + `</span>
    <span class='sensorValue'>No data</span>
    <span class="not-live pulse"></span>
  </div>
  <!-- end medium view -->

  `+ (function () {
        // console.log(sensor)
        if (sensor.sensorType == 'gate')
            return '<i class="fas fa-door-open"></i>'
        else if (sensor.sensorType == 'safety')
            return '<i class="fas fa-exclamation-triangle"></i>'
        else if (sensor.sensorType == 'segment')
            return '<i class="fas fa-box-open"></i>'
        else
            return ''
        // if(sensor.sensorType == 'segment')
        //     return '<i class="fas fa-grip-lines-vertical"></i><i class="fas fa-grip-lines-vertical"></i>'
    })() + `

    <!-- small view -->
    <div class='small-view'>
        <span class='sensorName'>Name: `+ sensor.sensorName + `</span>
    </div>
        <!-- end small view -->
        
  <!-- tooltip -->
  <span class="tooltiptext">
    <name>Name: `+ info.name + `</name>
    `+ (sensor.status ? '<br><state>Status: '+states_dict[sensor.status]+'</state>' : '') + `
    `+ (function(){

        if(sensor.statusTime) {
            let h = sensor.statusTime.split("T")[1].split(":")[0]
            let m = sensor.statusTime.split("T")[1].split(":")[1]
            let time = sensor.statusTime.split('T')[1].slice(0,5)
            let day = sensor.statusTime.split("T")[0].slice(5).split('-')[1]
            let month = sensor.statusTime.split("T")[0].slice(5).split('-')[0]
            let today = new Date()
            // console.log(sensor.sensorType, sensor.statusTime, today)
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            today = today.toLocaleDateString().slice(0,2)
            if(today==day) 
                return '<br><date>From: '+time+'</date>'
            return '<br><date>From: '+time + "<br>" + day + " " + " " + monthNames[parseInt(month)].slice(0,3)+'</date>'
        }
        

    })() + `
    `+
    (function(){
        if(sensor.usageTotal) {
            let usage
            if(sensor.sensorType != 'gate') {
                usage = humanizeDuration(sensor.usageTotal * 1000, {
                    language: "en",
                    spacer: "",
                    // units: ["h", "m", "s"],
                    units: ["h", "m"],
                    round: true
                })
                usage = usage.replaceAll("hours", "h")
                usage = usage.replaceAll("hour", "h")
                usage = usage.replaceAll("minutes", "m")
                usage = usage.replaceAll("minute", "m")
                usage = usage.replaceAll(",", "")
            } else {
                usage = sensor.usageTotal
            }
            return '<br><usage>Usage total: '+usage+'</usage>'
        }
    })()
    +`
  </span>
  <!-- end tooltip -->

</div>`

export let states_dict = {
    "run": "is running",
    "stop": "is stopped",
    "energy": "energy saving mode",
    "acc": "in accumulation",
    "error": "error",
    "open": "is open",
    "closed": "is closed",
    "close": "is closed",
    "press": "emergency button pressed",
    "released": "emergency button ok"
}