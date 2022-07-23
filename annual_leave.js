const { google } = require('googleapis');
const config = require("./config/config-annual-leave.json");
// Example data: [
//     [0]: '26/6/2022, 5:50:18',            
//     [1]: 'Nene Xena',         
//     [2]: 'ลาปกติ',         
//     [3]: '26/6/2022',         
//     [4]: '26/6/2022',         
//     [5]: '12:00',         
//     [6]: 'ออกไปข้างนอก oc',            
//     [7]: '1',         
//     [8]: 'Confirm'            
// ]

// Check out the user leaves of the day.
const checkUserLeavesToday = function() {
    // let results = new Array();
    let auth = config.authGoogleAPI
    const sheets = google.sheets({ version: 'v4', auth });

    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get({
            spreadsheetId: config.spreadsheetId,
            range: config.rangeAnnualLeave,
        }, (err, res) => {
            if (err) {
                console.log("The API returned an error: " + err)
                reject(err)
            }
            let response = new Array();
            let data = res.data.values
            for (let i = 0; i < data.length; i++) {
                if (checkDuringToday(data[i][3], data[i][4]) && data[i][8] === 'Confirm') {
                    response.push(data[i])
                }
            } // End loop
            // console.log(response.length)
            resolve(response)
        });
    }); // end promise
}

// Check out the user leaves of the date.
const checkUserLeavesDuringDate = function(date) {
    // let results = new Array();
    let auth = config.authGoogleAPI
    const sheets = google.sheets({ version: 'v4', auth });

    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get({
            spreadsheetId: config.spreadsheetId,
            range: config.rangeAnnualLeave,
        }, (err, res) => {
            if (err) {
                console.log("The API returned an error: " + err)
                reject(err)
            }

            let response = new Array();
            let data = res.data.values
            for (let i = 0; i < data.length; i++) {
                if (checkDuringDate(data[i][3], data[i][4], date) && data[i][8] === 'Confirm') {
                    response.push(data[i])
                }
            } // End loop

            resolve(response)
        });
    }); // end promise
}

// Check out the user leaves of the date.
const checkUserDutyLeavesDuringDate = function(date, duty) {
    // let results = new Array();
    let auth = config.authGoogleAPI
    const sheets = google.sheets({ version: 'v4', auth });

    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get({
            spreadsheetId: config.spreadsheetId,
            range: config.rangeAnnualLeave,
        }, (err, res) => {
            if (err) {
                console.log("The API returned an error: " + err)
                reject(err)
            }

            let response = new Array();
            let data = res.data.values
            for (let i = 0; i < data.length; i++) {
                if (checkDuringDate(data[i][3], data[i][4], date) && data[i][5] == duty && data[i][8] === 'Confirm') {
                    response.push(data[i])
                }
            } // End loop

            resolve(response)
        });
    }); // end promise
}

// Check during today
const checkDuringToday = (dateFrom, dateTo) => {
    var d1 = dateFrom.split("/");
    var d2 = dateTo.split("/");

    var check = new Date();
    var from = new Date(d1[2], parseInt(d1[1]) - 1, d1[0]); // -1 because months are from 0 to 11
    var to = new Date(d2[2], parseInt(d2[1]) - 1, d2[0]);
    check.setHours(0, 0, 0, 0)
    return (check >= from && check <= to)
}

const checkDuringDate = (dateFrom, dateTo, dateCheck) => {
    var d1 = dateFrom.split("/");
    var d2 = dateTo.split("/");
    var d3 = dateCheck.split("/");

    var check = new Date(d3[2], parseInt(d3[1]) - 1, d3[0]); // -1 because months are from 0 to 11 // yyyy/mm/dd
    var from = new Date(d1[2], parseInt(d1[1]) - 1, d1[0]);
    var to = new Date(d2[2], parseInt(d2[1]) - 1, d2[0]);
    check.setHours(0, 0, 0, 0)
    return (check >= from && check <= to)
}

module.exports = { checkUserLeavesToday, checkUserLeavesDuringDate, checkUserDutyLeavesDuringDate };