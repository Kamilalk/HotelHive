/** 
 * Arguments: 
 * 
 *  Staff: list of {id: string, role: oneOf('Housekeeper', 'Supervisor')}
 * 
 *  Rooms: list of {
 *          roomNumber: string
 *          roomFloor: string
 *          roomState: oneOf('departure', 'linenChange', 'stayover')
 *      }
 * 
 * Returns:
 *  Object with {
 *      (staff id) : ListOf(rooms)
 * } 
*/
export function allocateRoomsToStaff(staff, rooms) {
    console.log(staff, rooms);
    let supervisors = staff.filter(s => s.role === 'Supervisor').map(s => s.name);
    let housekeepers = staff.filter(s => s.role === 'Housekeeper').map(hk => hk.name);

    return {
        ...allocateRoomsToSupervisors(supervisors, rooms),
        ...allocateRoomsToHousekeepers(housekeepers, rooms)
    };
}

export function allocateRoomsToSupervisors(supervisors, rooms) {
    if(isEmpty(supervisors)) {
        return {};
    }

    if (supervisors.length === 1) {
        return { [supervisors[0]]: rooms };
    }

    return allocateByScore(
        sorted(rooms, r => r.beds ?? 1).reverse(), 
        sorted(supervisors), 
        (allocated, room) => sum(allocated, r => distanceBtwRooms(room, r))
    );
}

/** 
 * Arguments: 
 *  Staff: list of housekeeper ids (string)
 *  Rooms: list of {
 *          roomNumber: string
 *          floor: string
 *          roomState: oneOf('departure', 'linenChange', 'stayover')
 *      }
*/
export function allocateRoomsToHousekeepers(housekeepers, rooms) {
    if(isEmpty(housekeepers)) {
        return {};
    }

    if (housekeepers.length === 1) {
        return setDepartedRoomsFirst({ [housekeepers[0]]: rooms });
    }

    let roomsToClean = rooms.filter(needsToBeCleaned);
    
    return setDepartedRoomsFirst(
        allocateByScore(
            sorted(roomsToClean, r => r.beds ?? 1).reverse(), // Sorted by no. of beds
            sorted(housekeepers), // Sorted by name
            (allocated, room) => [
                sum(allocated.map(beds)) + beds(room),
                sum(allocated, r => distanceBtwRooms(room, r))
            ]
        )
    );
}

function setDepartedRoomsFirst(allocation) {
    return mapValues(allocation, rooms => {
        let departed = rooms.filter(r => r.roomState === 'departure');
        let notDeparted = rooms.filter(r => r.roomState !== 'departure');
        return [...departed, ...notDeparted];
    });
}

function allocateByScore(rooms, housekeepers, scoreFn) {
    let allocatedSoFar = Object.fromEntries(housekeepers.map(hk => [hk, []]));
    for (const room of rooms) {
        // The room gets a score table for getting into any hk's list
        // The score represents affinity for the other already allocated rooms (less is better)
        let roomScores = housekeepers.map(hk => [hk, scoreFn(allocatedSoFar[hk], room)]);
        // The room gets added to the hk with the mainimum score
        let [minScoreHousekeeper, minScore] = findMinimumScore(roomScores);
        allocatedSoFar[minScoreHousekeeper].push(room);
    }
    return allocatedSoFar;
}

function findMinimumScore(scores) {
    let [minScoreHk, minScore] = scores[0];
    for (const [hk, score] of scores) {
        if (score < minScore) {
            [minScoreHk, minScore] = [hk, score];
        }
    }
    return [minScoreHk, minScore];
}

function distanceBtwRooms(room1, room2) {
    return (room1.floor === room2.floor) ? 0 : 10;
}

function beds(room) {
    return room.beds ?? 1;
}

function needsToBeCleaned(room) {
    return ['departure', 'linenChange', 'stayover'].includes(room.roomState);
}

function isEmpty(array) {
    return array.length === 0;
}

function mapValues(object, fn) {
    return Object.fromEntries(Object.entries(object).map(([k, v]) => [k, fn(v)]));
}

function sum(array, keyFn) { 
    let fn = keyFn ?? (x => x)
    return array.reduce((a,b) => fn(a)+fn(b), 0); 
}

function sorted(iterable, keyFn) {
    if (keyFn)
        return [...iterable].sort((a,b) => keyFn(a) - keyFn(b)); 
    return [...iterable].sort();
}