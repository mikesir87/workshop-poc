const os = require('os');
const Dockerode = require("dockerode");

/**
 * 
 * @param {Dockerode} dockerClient 
 * @param {Dockerode.ContainerInspectInfo} containerData 
 */
async function determineNetworkConnectivity(dockerClient, containerData) {
  let selfInfo = await dockerClient.getContainer(os.hostname()).inspect();
  let selfNetworkNames = Object.keys(selfInfo.NetworkSettings.Networks || {})
      .filter(name => name !== 'bridge');

  if (selfNetworkNames.length === 0) {
    console.log("No non-bridge networks found for self container, creating a new network.");
    const selfNetwork = await dockerClient.createNetwork({ Name: "host-proxy-watcher-" + os.hostname() });
    await selfNetwork.connect({ Container: selfInfo.Id });

    selfInfo = await dockerClient.getContainer(os.hostname()).inspect();
    selfNetworkNames = Object.keys(selfInfo.NetworkSettings.Networks || {})
      .filter(name => name !== 'bridge');
  }

  if (Object.keys(containerData.NetworkSettings.Networks).indexOf(selfNetworkNames[0]) === -1) {
    console.log(`Connecting ${containerData.Id.substring(0, 8)} to the forwarding network ${selfNetworkNames[0]}`);
    await dockerClient.getNetwork(selfNetworkNames[0]).connect({
      Container: containerData.Id,
    });

    const updatedContainerData = await dockerClient.getContainer(containerData.Id).inspect();
    containerData.NetworkSettings = updatedContainerData.NetworkSettings;
  } else {
    console.log(`Container ${containerData.Id.substring(0, 8)} is already connected to the forwarding network ${selfNetworkNames[0]}. No change required.`);
  }

  return {
    networkName: selfNetworkNames[0], 
    ipAddress: containerData.NetworkSettings.Networks[selfNetworkNames[0]].IPAddress
  };
}

module.exports = {
  determineNetworkConnectivity,
};