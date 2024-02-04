FROM node:lts-alpine3.19
RUN mkdir -p /opt/cerberus
RUN mkdir -p /opt/cerberus/backend
RUN mkdir -p /opt/cerberus/frontend
WORKDIR /opt/cerberus
COPY backend/package.json backend/package-lock.json backend/
COPY frontend/package.json frontend/package-lock.json frontend/
WORKDIR /opt/cerberus/backend
RUN npm install
WORKDIR /opt/cerberus/frontend
RUN npm install
WORKDIR /opt/cerberus
COPY backend/ .
COPY frontend/ .

#############################
# SET ENV VARIABLES HERE
#############################


#############################
# REPLACE WITH YOUR OWN CERT
#############################
#COPY powershellcert.pfx .

WORKDIR /opt/cerberus/frontend
RUN ls -R
RUN npm run build
RUN mv build ../backend/
WORKDIR /opt/cerberus/backend

####################################
# REPLACE WITH YOUR CONFIGURED PORT
####################################
EXPOSE 443

CMD ["npm", "start"]