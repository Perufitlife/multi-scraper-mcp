FROM apify/actor-node:22

COPY --chown=myuser:myuser package*.json ./

RUN npm --quiet set progress=false \
    && npm install --only=prod --no-optional

COPY --chown=myuser:myuser . ./

CMD npm start
