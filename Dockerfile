ARG NODE_IMAGE=node:20.16.0-alpine

FROM $NODE_IMAGE AS base
RUN apk --no-cache add dumb-init
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node
RUN mkdir tmp

FROM base AS dependencies

# Utiliser temporairement l'utilisateur root pour installer globalement
USER root
COPY --chown=node:node ./package*.json ./
RUN npm install -g @adonisjs/cli

# Revenir à l'utilisateur node pour les autres commandes
USER node
RUN npm ci \
    && rm -rf node_modules \
    && npm install

COPY --chown=node:node . .

FROM dependencies AS build
RUN node ace build --production

FROM base AS production
ENV NODE_ENV=production
ENV PORT=${PORT:-3333}
ENV HOST=0.0.0.0
COPY --chown=node:node package*.json ./
RUN npm ci --production
COPY --chown=node:node --from=build /home/node/app/build .

EXPOSE $PORT
CMD [ "dumb-init", "node", "server.js" ]
