import { allocateRoomsToHousekeepers }  from '../src/components/Pages/RoomAssignments/RoomAlocALg/room-allocation';

function getRoomNumber(room) { return room.roomNumber; }
function sorted(iterable) { return [...iterable].sort(); }
function compareIgnoreOrder(iterable) { return sorted(iterable).join(); }
function transform(object, fransformFn) { return Object.fromEntries(Object.entries(object).map(fransformFn)); }
function sum(array) { return array.reduce((a,b) => a+b, 0); }

describe('allocateRoomsToHousekeepers', () => {
  
  it('(EDGE CASE) Returns no allocations when there is no staff', () => {
    expect(allocateRoomsToHousekeepers([], [])).toEqual({});
    expect(allocateRoomsToHousekeepers([], ['mock room'])).toEqual({});
  });

  it('(EDGE CASE) When there is only one staff, allocates everything to the same', () => {
    let singleStaff = 'me';
    let singleRoom = 'just one room';
    expect(allocateRoomsToHousekeepers([singleStaff], [singleRoom]))
      .toEqual({[singleStaff]: [singleRoom]});
  });

  it('(R1) Allocates all rooms that need cleaning', () => {
    let rooms = [
      {roomNumber: 104, roomState: 'departure'},
      {roomNumber: 405, roomState: 'linenChange'},
      {roomNumber: 214, roomState: 'stayover'},
      {roomNumber: 206, roomState: 'departure'},
    ];
    
    let result = allocateRoomsToHousekeepers(['hk1', 'hk2'], rooms);
    let allocatedRooms = Object.values(result).flat().map(getRoomNumber);
    let allRooms = rooms.map(getRoomNumber);
    expect(compareIgnoreOrder(allocatedRooms)).toEqual(compareIgnoreOrder(allRooms));
  });

  it('(SPECIAL CASE R1-1) Rooms not needing to be cleaned remain unallocated', () => {
    let rooms = [
      {roomNumber: 104, roomState: 'departure'},
      {roomNumber: 405, roomState: 'clean'},
      {roomNumber: 214, roomState: 'clean'}
    ];
    
    let result = allocateRoomsToHousekeepers(['hk1', 'hk2'], rooms);
    let allocatedRooms = Object.values(result).flat().map(getRoomNumber);
    expect(allocatedRooms).toContain(104);
    expect(allocatedRooms).not.toContain(405);
    expect(allocatedRooms).not.toContain(214);
  });

  it('(R2) Balances beds to clean as evenly as possible among staff.', () => {
    let rooms = [
      {roomNumber: 104, beds: 1, roomState: 'departure'},
      {roomNumber: 405, beds: 4, roomState: 'linenChange'},
      {roomNumber: 214, beds: 2, roomState: 'stayover'}
    ];
    
    let result = allocateRoomsToHousekeepers(['hk1', 'hk2'], rooms);
    let bedsPerStaff = transform(result, ([staff, rooms]) => [staff, sum(rooms.map(r => r.beds))]);
    expect(bedsPerStaff['hk1']).toBe(4);
    expect(bedsPerStaff['hk2']).toBe(3);
  });

  it('(R3) Minimizes the distance each staff has to travel (btw floors)', () => {
    let rooms = [
        {roomNumber: 205, floor:2, roomState: 'linenChange'},
        {roomNumber: 104, floor:1, roomState: 'departure'},
        {roomNumber: 212, floor:2, roomState: 'linenChange'},
        {roomNumber: 114, floor:1, roomState: 'stayover'},
        {roomNumber: 206, floor:2, roomState: 'departure'},
    ];

    let result = allocateRoomsToHousekeepers(['hk1', 'hk2'], rooms);
    let roomsPerStaff = transform(result, ([staff, rooms]) => [staff, rooms.map(r => r.roomNumber)]);
    expect(Object.values(roomsPerStaff).map(compareIgnoreOrder)).toContain(compareIgnoreOrder([104,114]));
    expect(Object.values(roomsPerStaff).map(compareIgnoreOrder)).toContain(compareIgnoreOrder([205, 212, 206]));
  })

  it('(R4) Accomodates checked out rooms on the top of the list', () => {
    let housekeeper = 'just me';
    let rooms = [
      {roomNumber: 104, roomState: 'departure'},
      {roomNumber: 405, roomState: 'linenChange'},
      {roomNumber: 214, roomState: 'stayover'},
      {roomNumber: 206, roomState: 'departure'},
    ];
    let result = allocateRoomsToHousekeepers([housekeeper], rooms);
    expect(result[housekeeper].map(getRoomNumber)).toEqual([104, 206, 405, 214]);
  })
});