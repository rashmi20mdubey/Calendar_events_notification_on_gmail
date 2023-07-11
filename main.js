var calendarId;
var token;
async function getCalendarData(init) {
    const CalendarJson = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', init);
    const CalendarList = await CalendarJson.json();
    var calendars = CalendarList.items;
    if (calendars.length>0){
        for (var i = 0; i < calendars.length; i++){
            if (calendars[i].primary){
                calendarId = calendars[i].id;
                break;
            }
        }
        await  getCalendarEvent(init, calendarId);    
    }
    else{
        return false;
    }
}

async function getCalendarEvent(init) {
    const timeMin = new Date();
    const timeMax = new Date(timeMin.getTime() + (15 * 60 * 1000));
    const current_time = timeMin.getHours()+':'+timeMin.getMinutes();
    const eventJson = await fetch('https://www.googleapis.com/calendar/v3/calendars/' + calendarId + '/events?timeMax=' + timeMax.toISOString() + '&timeMin=' + timeMin.toISOString(), init);
    const eventList = await eventJson.json();
    const events = eventList.items;
    if (events.length > 0){
        for (var i = 0; i < events.length; i++){
            const event = events[i];
            if(event.start != "cancelled"){
                const event_start_Time = new Date(event.start.dateTime);
                const ten_min = new Date(event_start_Time - (10 * 60 * 1000));
                const ten_min_time = ten_min.getHours()+':'+ten_min.getMinutes();
                const five_min = new Date(event_start_Time - (5 * 60 * 1000));
                const five_min_time = five_min.getHours()+':'+five_min.getMinutes();
                if(current_time === ten_min_time || current_time === five_min_time){
                    Notification.requestPermission().then(perm =>{
                        if (perm === "granted"){
                            var notification = new Notification("Mail.google.com says", { body: event.summary + " is starting at " + event_start_Time + ". Please Join"});  
                            notification.onclick = function () {
                                window.open(event.htmlLink);
                            };                     
                        }
                    })                               
                }
            }
            else{
                return false;
            }
        }
    }
    else{
        return false;
    }
}

async function initCalendar() {
    token = await chrome.runtime.sendMessage('authorization');
    let init = {
        method: 'GET',
        async: true,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        'contentType': 'json'
    };
    setInterval(() => {
        getCalendarData(init);
    }, 60000);
}

const init = async () => {
    initCalendar();
};
    
const main = async () => {
    await init();
};

main();  