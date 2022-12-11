const defaultVias: readonly string[] = ['jae.fi'];

const matrixSchemeGenerator = (roomid: string, server: string, via?: readonly string[]): string => {
    const viaList = via?.join("&via=") ?? defaultVias.join("&via=");
    const roomUri = `matrix:roomid/${roomid}:${server}?action=join&via=${viaList}`;

    return roomUri;
}

const elementSchemeGenerator = (roomid: string, server: string, room: boolean, via?: readonly string[]): string => {
    const viaList = via?.join("&via=") ?? defaultVias.join("&via=");

    const dirSymbol = room
        ? "#"
        : "!";
    
    const roomUri = `element://vector/webapp/#/room/${dirSymbol}${roomid}:${server}?via=${viaList}`;

    return roomUri;
}

export { matrixSchemeGenerator, elementSchemeGenerator };
