# Workshop PoC

This workshop is merely a proof of concept on the various technical aspects needed to put together a workshop and deliver it via Docker Desktop.


## Workshop contents

1. [Running, troubleshooting, and connecting to a containerized database](./1-containers)
2. [Sharing container configurations in your projects](./2-sharing-container-config)
3. [Building a container image](./3-building-images)
4. [Securing your container images](./4-securing-images)


## The sample application

The application used with this workshop is a fairly simple Node application in which todo items are stored in a PostgreSQL database.

There are also a few [Testcontainer](https://testcontainers.com/) integration tests bundled in the project, although they are not the focus of the workshop. 
