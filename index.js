const childProcess = require('child_process');

const GITCLONE_PROCESS_HANDLED_EVENTS = ['disconnect', 'error', 'exit', 'message', 'channel'];
// Wrap off differences between sync processes and async ones.
function processOn(process, sync, event, listener) {
    if (!sync) {
        process.on(event, listener);
    } else {
        switch (event) {
            case 'exit':
            case 'close':
                listener && listener(process.status, process.signal);
                break;
            case 'disconnect':
                listener && listener();
                break;
            case 'error':
                listener && listener(process.error);
                break;
            case 'message':
            case 'channel':
                // event type omitted.
                break;
        }
    }
}

/**
 *
 * @param {string} repo repo's clone path
 * @param {string} targetPath save path
 * @param {Object} opts options
 * @param {function} cb callback function, $0 for event, $1 for info.
 * @return {promise}
 */
module.exports = function (repo, targetPath, opts, cb) {
    opts = opts || {};
    // get spawn method.
    const isSync = opts.sync;
    const spawn = opts.sync ? childProcess.spawnSync : childProcess.spawn;
    const git = opts.git || 'git';
    let args = ['clone'];
    // Make it able to add user defined arguments.
    // checking user defined args whether being conflict with default ones.
    const userDefinedArgs = opts.args || [];

    if (opts.shallow) {
        if (userDefinedArgs.find(_ => v.trim() === '--depth')) {
            reject(new Error("You cannot specify `--depth` by yourself when shallow is set `true`"));
            return;
        }
        args.push('--depth');
        args.push('1');
    }
    args.push('--');
    args.push(repo);
    args.push(targetPath);

    args.push('--progress');
    args = args.concat(userDefinedArgs);

    const process = spawn(git, args);
    // Add listener.
    GITCLONE_PROCESS_HANDLED_EVENTS.forEach(event => {
        processOn(process, isSync, event, function (process, par0, par1) {
            cb && cb(process, event, par0, par1);
        });
    })

    return new Promise((resolve, reject) => {
        processOn(process, isSync, 'close', function (status) {
            if (status == 0) {
                if (opts.checkout) {
                    _checkout();
                } else {
                    resolve();
                }
            } else {
                reject(new Error("'git clone' failed with status " + status));
            }
        })
        function _checkout() {
            const args = ['checkout', opts.checkout];
            const process = spawn(git, args, { cwd: targetPath });
            process.on('close', function (status) {
                if (status == 0) {
                    resolve();
                } else {
                    reject(new Error("'git checkout' failed with status " + status));
                }
            });
        }
    })
}