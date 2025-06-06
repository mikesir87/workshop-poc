# Workshop PoC

This workshop is merely a proof of concept on the various technical aspects needed to put together a workshop and deliver it via Docker Desktop.


## Workshop contents

1. [Running, troubleshooting, and connecting to a containerized database](./docs/1-containers.md)
2. [Sharing container configurations in your projects](./docs/2-sharing-container-config.md)
3. [Building a container image](./docs/3-building-images.md)
4. [Securing your container images](./docs/4-securing-images.md)


## The sample application

The application used with this workshop is a fairly simple Node application in which todo items are stored in a PostgreSQL database.

There are also a few [Testcontainer](https://testcontainers.com/) integration tests bundled in the project, although they are not the focus of the workshop. 
