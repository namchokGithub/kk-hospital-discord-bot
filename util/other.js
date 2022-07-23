module.exports = {
    changeDateFormat01(date) {
        var d1 = date.split("/");
        return d1[2] + "/" + d1[1] + "/" + d1[0]
    },

    getDutyWithHour(hour) {
        var duty = "00:00"
        var x = hour
        switch (true) {
            case (x >= 21):
                duty = '21:00';
                break;
            case (x >= 18):
                duty = '18:00'
                break;
            case (x >= 15):
                duty = '15:00'
                break;
            case (x >= 12):
                duty = '12:00'
                break;
            case (x >= 9):
                duty = '09:00'
                break;
            case (x >= 6):
                duty = '06:00'
                break;
            case (x >= 3):
                duty = '03:00'
                break;
            case (x >= 0):
                duty = '00:00'
        }
        return duty
    },

    changeDateFormat(dateFrom) {
        var d1 = dateFrom.split("/");

        return d1[1] + "/" + d1[0] + "/" + d1[2]
    }
};