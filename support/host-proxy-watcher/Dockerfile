FROM node:lts-slim
WORKDIR /usr/local/app

RUN apt update && \
    apt install -y socat && \
    rm -rf /var/lib/apt/lists/*

COPY package* ./
RUN npm install --omit=dev
COPY ./src ./src
CMD ["node", "src/index.js"]
