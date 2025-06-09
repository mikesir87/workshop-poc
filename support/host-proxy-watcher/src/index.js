const Docker = require('dockerode');
const child_process = require('child_process');

const docker = new Docker();
const filterExpr = process.env.CONTAINER_FILTER ? JSON.parse(process.env.CONTAINER_FILTER) : {};
const PORT_OFFSET = parseInt(process.env.PORT_OFFSET || '0', 10);

const tearDowns = {};

async function onContainerStart(containerId) {
  const containerData = await docker.getContainer(containerId).inspect();
  if (!containerData)
    return;

  if (containerData.NetworkSettings && containerData.NetworkSettings.Ports) {
    const ports = Object.keys(containerData.NetworkSettings.Ports)
      .filter(portKey => containerData.NetworkSettings.Ports[portKey])
      .map(portKey => parseInt(portKey.split('/')[0], 10));

    const socatProcs = [];

    ports.forEach(port => {
      const hostPort = port + PORT_OFFSET;
      /*
      const containerIP = containerData.NetworkSettings.IPAddress ||
        (containerData.NetworkSettings.Networks && Object.values(containerData.NetworkSettings.Networks)[0].IPAddress);

      if (!containerIP) {
        console.warn(`No IP address found for container ${containerData.Id}`);
        return;
      }
      */
      const containerIP = "host.docker.internal";

      console.log(`Setting up port forwarding: host port ${hostPort} -> container ${containerIP}:${port}`);

      const socatCmd = `socat TCP-LISTEN:${hostPort},fork,reuseaddr TCP:${containerIP}:${port}`;
      const proc = child_process.spawn('sh', ['-c', socatCmd], {
        stdio: 'inherit'
      });
      socatProcs.push(proc);

      proc.on('exit', (code, signal) => {
        console.log(`socat process for port ${port} exited with code ${code}, signal ${signal}`);
      });

      console.log(`Started socat: host port ${hostPort} -> container ${containerIP}:${port}`);
    });
    
    // Store teardown function for this container
    tearDowns[containerData.Id] = async () => {
      console.log(`Tearing down resources for container ${containerData.Id}`);
      socatProcs.forEach(proc => {
        if (!proc.killed) proc.kill();
      });
      delete tearDowns[containerData.Id];
      console.log(`Resources removed for container ${containerData.Id}`);
    };
  }

  console.log(`Container ID: ${containerData.Id}`);
  // console.log(JSON.stringify(containerData, null, 2));
}

async function onContainerDie(containerId) {
  const containerData = await docker.getContainer(containerId).inspect();
  if (!containerData)
    return;
  
  if (tearDowns[containerData.Id]) {
    await tearDowns[containerData.Id]();
    console.log(`Tore down resources for container ${containerData.Id}`);
  }
}

docker.listContainers({ filters: filterExpr }, (err, containers) => {
  if (err) {
    console.error('Error listing Docker containers:', err.message);
    process.exit(1);
  }

  containers.forEach(containerInfo => {
    onContainerStart(containerInfo.Id).catch(err => {
      console.error(`Error starting container ${containerInfo.Id}:`, err.message);
    });
  });
});

docker.getEvents({ filters: filterExpr }, (err, stream) => {
  if (err) {
    console.error('Error connecting to Docker events:', err.message);
    process.exit(1);
  }

  stream.on('data', (chunk) => {
    try {
      const event = JSON.parse(chunk.toString());
      if (event.Type === 'container') {
        if (event.Action === 'start')
          onContainerStart(event.id);
        else if (event.Action === 'die')
          onContainerDie(event.id);
      }
    } catch (e) {
      console.error('Error parsing Docker event:', e.message);
    }
  });

  stream.on('error', (err) => {
    console.error('Docker event stream error:', err.message);
  });
});

console.log('Watching for Docker container events...');

["SIGINT", "SIGTERM", "SIGUSR2"].forEach((signal) => {
  process.on(signal, async () => {
    console.log(`Received ${signal}, shutting down...`);
    await Promise.all(Object.values(tearDowns).map(fn => fn()));
    process.exit(0);
  });
});
