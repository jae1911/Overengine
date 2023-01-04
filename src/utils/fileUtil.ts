import { readdirSync, statSync } from 'fs';

import { Address6 } from 'ip-address';

import { BASE_CONTENT_DIR } from '../environment';

// Scours directories and only returns markdown files
// eslint-disable-next-line functional/prefer-readonly-type
function scourDirectory(path: string, _files?: string[]): string[] {
    // eslint-disable-next-line functional/prefer-readonly-type
    const files_: string[] = _files ?? [];

    const files = readdirSync(path);

    files.forEach((file: string) => {
        const name = path + "/" + file;

        if (statSync(name).isDirectory()) {
            scourDirectory(name, files_);

        // eslint-disable-next-line functional/immutable-data
        } else if (name.split(".").pop() == "md") {
            // eslint-disable-next-line functional/immutable-data
            files_.push(name.replace(BASE_CONTENT_DIR, ""));
        }
    })

    return files_;
}

// Determines the type of IP address
function isLegacy(ip: string): boolean {
    const addr = new Address6(ip);

    return addr.v4;
}

export { scourDirectory, isLegacy };
