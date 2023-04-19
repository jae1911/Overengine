const defaultVias: readonly string[] = ['jae.fi'];

const matrixSchemeGenerator = (id: string, server: string, via?: readonly string[], isUser?: boolean): string => {
    const viaList = via?.join("&via=") ?? defaultVias.join("&via=");
    return `matrix:${isUser ? 'u' : 'roomid'}/${id}:${server}?action=join&via=${viaList}`;
}

const elementSchemeGenerator = (roomid: string, server: string, room: boolean, via?: readonly string[]): string => {
    const viaList = via?.join("&via=") ?? defaultVias.join("&via=");

    const dirSymbol = room
        ? "#"
        : "!";
    
    return `element://vector/webapp/#/room/${dirSymbol}${roomid}:${server}?via=${viaList}`;
}

export { matrixSchemeGenerator, elementSchemeGenerator };
