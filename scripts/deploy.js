const path = require('path');
const { spawn } = require('child_process');

const SSH_USER_HOST = 'augur@eth2.augur.net';

prep();

function prep() {
  const prep = spawn('ssh', [`${SSH_USER_HOST}`, "cd /var/www; sudo rm -rf dev.augur.net; sudo mkdir dev.augur.net; cd; rm -rf TMP-DEV-COPY; mkdir TMP-DEV-COPY"]);

  prep.stdout.on('data', data => console.log(`prep out -- ${data}`));
  prep.stderr.on('data', data => console.log(`prep err -- ${data}`));
  prep.on('close', (code) => {
    console.log(`prep child process exited with code ${code}`);

    if (code === 0) {
      copyBuild();
    } else {
      cleanup();
    }
  });
}

function copyBuild() {
  const BUILD_DIR = path.join(__dirname, '../build');
  const copy = spawn('scp', ['-r', `${BUILD_DIR}/`, `${SSH_USER_HOST}:./TMP-DEV-COPY`])

  copy.stdout.on('data', data => console.log(`copyBuild out -- ${data}`));
  copy.stderr.on('data', data => console.log(`coypBuild err -- ${data}`));
  copy.on('close', (code) => {
    console.log(`copyBuild child process exited with code ${code}`);

    cleanup();
  });
}

function cleanup() {
  const cleanup = spawn('ssh', [`${SSH_USER_HOST}`, "cd; sudo cp -R TMP-DEV-COPY/build/* /var/www/dev.augur.net; rm -rf TMP-DEV-COPY"]);

  cleanup.stdout.on('data', data => console.log(`cleanup out -- ${data}`));
  cleanup.stderr.on('data', data => console.log(`cleanup err -- ${data}`));
  cleanup.on('close', (code) => console.log(`cleanup child process exited with code ${code}`));
};
