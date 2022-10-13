import { readdirSync, statSync } from 'fs';

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

// Finds a post with particular date and time

export default scourDirectory;
