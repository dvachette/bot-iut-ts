export function dateStart(when:String) {
    var date : Date;
    switch (when) {
        case "today":
            date = new Date();
            return date;
        case "tomorrow":
            date = new Date();
            date.setDate(new Date().getDate() + 1);
            return date;
        case "week":
            date = new Date();
            date.setDate(new Date().getDate() - new Date().getDay()+1)
            return date;
        case "nextweek":
            date = new Date();
            date.setDate(new Date().getDate() - new Date().getDay()+8)
            return date;
        default:
            return new Date();
    }
}

export function dateEnd(when:String) {
    var date : Date;
    switch (when) {
        case "today":
            date = new Date();
            date.setDate(new Date().getDate());
            return date;
        case "tomorrow":
            date = new Date();
            date.setDate(new Date().getDate()+1);
            return date;
        case "week":
            date = new Date();
            date.setDate(new Date().getDate() - new Date().getDay()+7)
            return date;
        case "nextweek":
            date = new Date();
            date.setDate(new Date().getDate() - new Date().getDay()+14)
            return date;
        default:
            return new Date();
    }
}