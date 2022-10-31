import { readdirSync, statSync } from 'fs';
import { Address6 } from 'ip-address';

import { BASE_CONTENT_DIR } from '../environment';

// Scours directories and only returns markdown files
function scourDirectory(path: string, _files?: string[]): string[] {
    let files_: string[] = _files ?? [];

    let files = readdirSync(path);
    for (let i in files) {
        let name = path + '/' + files[i];
        if (statSync(name).isDirectory()) {
            scourDirectory(name, files_)
        } else {
            if (name.split('.').pop() == 'md')
                files_.push(name.replace(BASE_CONTENT_DIR, ''));
        }
    }

    return files_;
}

// Determines the type of IP address
function isLegacy(ip: string): boolean {
    const addr = new Address6(ip);

    return !addr.address4;
}

export { scourDirectory, isLegacy };
