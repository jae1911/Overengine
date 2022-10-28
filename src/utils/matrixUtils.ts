const defaultVias: string[] = ['jae.fi'];

class MatrixUtils {

    public standardRedirector(roomid: string, server: string, via?: string[]): string {
        const viaList = via?.join('&via=') ?? defaultVias.join('&via=');

        const roomUri = `matrix:roomid/${roomid}:${server}?action=join&via=${viaList}`;

        return roomUri;
    }

    public elementRedirector(roomid: string, server: string, room?: boolean, via?: string[]): string {
        const viaList = via?.join('&via=') ?? defaultVias.join('&via=');
        const directorSymbol = room ? '#' : '!';

        const roomUri = `element://vector/webapp/#/room/${directorSymbol}${roomid}:${server}?via=${viaList}`;

        return roomUri;
    }

}

export default MatrixUtils;
