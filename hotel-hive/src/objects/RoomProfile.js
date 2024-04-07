 export class RoomProfile {
    constructor(roomNumber, hotelId, floor, beds, roomType, occupationStatus, cleaningStatus, additionalNotes, reservationFrom, reservationTo, currentRes) {
        this.roomNumber = roomNumber;
        this.hotelId = hotelId;
        this.floor = floor;
        this.beds = beds;
        this.roomType = roomType;
        this.occupationStatus = occupationStatus;
        this.cleaningStatus = cleaningStatus;
        this.additionalNotes = additionalNotes;
        this.reservationFrom = reservationFrom;
        this.reservationTo = reservationTo;
        this.currentRes = currentRes;
    }
}
