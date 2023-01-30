type Queue = {
    link: string,
    title: string,
    artist: string,
    requester: string,
    requestChannel: string,
}

let queue: Queue[] = [];

export function add(link: string, title: string, artist: string, requester: string, requestChannel: string) {
    let json: Queue = {
        link: link,
        title: title,
        artist: artist,
        requester: requester,
        requestChannel: requestChannel
    }

    queue.push(json);
}

export function remove(index: number) {
    const json = queue[index];
    queue.splice(index, 1);
    return json;
}

export function get() {
    return queue;
}

export function clear() {
    queue = [];
}

export function getLength() {
    return queue.length;
}

export function getNext() {
    if (queue.length == 0) return null;
    const json = queue[0];
    queue.shift();
    return json;
}