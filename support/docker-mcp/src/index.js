import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import Docker from "dockerode";
import fs from "fs";
import zod from "zod";

const docker = new Docker();

// Create an MCP server
const server = new McpServer({
  name: "Docker Training MCP",
  version: "1.0.0"
});

// Add an addition tool
server.tool(
  "get-containers",
  "Get a list of all of the containers on the host",
  { },
  async ({ }) => {
    try {

      const containers = await docker.listContainers();
      
      fs.writeFileSync("log.txt", JSON.stringify(containers, null, 2));
      
      const containerDetails = containers.map(container => [
          `Id: ${container.Id}`,
          `Created: ${new Date(container.Created * 1000).toLocaleString()}`,
          `Status: ${container.Status}`,
          `State: ${container.State}`,
          `Name(s): ${container.Names.join(", ")}`,
          `Image: ${container.Image}`,
          `Command: ${container.Command}`,
          `Ports: ${container.Ports?.map(port => `${port.IP ? port.IP + ":" : ""}${port.PrivatePort}/${port.Type} ${port.PublicPort ? `mapped to host port ${port.PublicPort}` : ""}`).join(", ")}`,
          `Networks: ${Object.keys(container.NetworkSettings.Networks).join(", ")}`,
          `Labels: ${Object.entries(container.Labels || {}).map(([key, value]) => `${key}=${value}`).join(", ")}`,
          `Mounts: ${container.Mounts.map(mount => `${mount.Type}: ${mount.Source} -> ${mount.Destination}`).join(", ") || "None"}`,
        ].join("\n")
      ).join("\n---- START NEW CONTAINER DESCRIPTION ----\n");
      
      return {
        content: [{ type: "text", text: `Here is a summary of the available containers. Note that not all details are in this summary, so additional context may be needed for a specific container\n---- START CONTAINER LIST ----\n${containerDetails}` }]
      }
    } catch (error) {
      console.error("Error fetching containers:", error);
      return {
        content: [{ type: "text", text: `Error fetching containers: ${error.message}` }]
      };
    }
  },
);

server.tool(
  "get-container-details",
  "Get details about a specific container by ID",
  {
    containerId: zod.string().describe("The ID of the container to get details for").nonempty(),
  },
  async ({ containerId }) => {
    try {
      const container = docker.getContainer(containerId);
      const rawData = await container.inspect();

      const data = JSON.parse(JSON.stringify(rawData));
      ["GraphDriver", "ResolvConfPath", "HostnamePath", "HostsPath", "LogPath", "HostConfig.ConsoleSize", "HostConfig.MaskedPaths", "HostConfig.ReadonlyPaths", "ImageManifestDescriptor"].forEach(key => {
        const splitPath = key.split(".");
        let current = data;
        for (let i = 0; i < splitPath.length - 1; i++) {
          if (current[splitPath[i]]) {
            current = current[splitPath[i]];
          } else return;
        }
        delete current[splitPath[splitPath.length - 1]];
      });
      
      fs.writeFileSync("log.txt", JSON.stringify(data, null, 2));
      
      return {
        content: [{ type: "text", text: JSON.stringify(data) }]
      }
    } catch (error) {
      console.error("Error fetching container details:", error);
      return {
        content: [{ type: "text", text: `Error fetching container details: ${error.message}` }]
      };
    }
  },
);

server.tool(
  "get-images",
  "Get a list of all of the images created within the last 24 hours",
  { },
  async ({ }) => {
    try {
      const images = await docker.listImages();
      
      fs.writeFileSync("log.txt", JSON.stringify(images, null, 2));
      
      const imageDetails = images
        .filter(image => image.Created * 1000 > Date.now() - 24 * 60 * 60 * 1000) // Only include images created in the last 24 hours
        .map(image => [
            `Id: ${image.Id}`,
            `Created: ${new Date(image.Created * 1000).toLocaleString()}`,
            `Size: ${(image.Size / (1024 * 1024)).toFixed(2)} MB`,
            `RepoTags: ${image.RepoTags?.join(", ") || "None"}`,
            `Labels: ${Object.entries(image.Labels || {}).map(([key, value]) => `${key}=${value}`).join(", ") || "None"}`,
          ].join("\n")
        )
        .join("\n---- START NEW IMAGE DESCRIPTION ----\n");
      
      return {
        content: [{ type: "text", text: imageDetails }]
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      return {
        content: [{ type: "text", text: `Error fetching images: ${error.message}` }]
      };
    }
  },
);

server.tool(
  "get-networks",
  "Get a list of all of the networks on the host",
  { },
  async ({ }) => {
    try {
      const networks = await docker.listNetworks();
      
      fs.writeFileSync("log.txt", JSON.stringify(networks, null, 2));
      
      const networkDetails = networks.map(network => [
          `Id: ${network.Id}`,
          `Name: ${network.Name}`,
          `Created: ${network.Created}`,
          `Labels: ${Object.entries(network.Labels || {}).map(([key, value]) => `${key}=${value}`).join(", ") || "None"}`,
        ].join("\n")
      ).join("\n---- START NEW NETWORK DESCRIPTION ----\n");
      
      return {
        content: [{ type: "text", text: networkDetails }]
      }
    } catch (error) {
      console.error("Error fetching networks:", error);
      return {
        content: [{ type: "text", text: `Error fetching networks: ${error.message}` }]
      };
    }
  },
)



// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);