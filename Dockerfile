FROM node:lts-alpine3.19
RUN mkdir -p /opt/cerberus
RUN mkdir -p /opt/cerberus/backend
RUN mkdir -p /opt/cerberus/frontend
WORKDIR /opt/cerberus
COPY ./backend/ /opt/cerberus/backend/
COPY ./frontend/ /opt/cerberus/frontend/
WORKDIR /opt/cerberus/backend
RUN npm install
WORKDIR /opt/cerberus/frontend
RUN npm install
RUN npm run build

#############################
# SET ENV VARIABLES HERE
#############################


#############################
# REPLACE WITH YOUR OWN CERT
#############################
#COPY powershellcert.pfx .

WORKDIR /opt/cerberus/frontend
RUN ls -laR /opt/cerberus/
RUN mv build ../backend/
WORKDIR /opt/cerberus/backend
RUN rm -rf /opt/cerberus/frontend

####################################
# REPLACE WITH YOUR CONFIGURED PORT
####################################
EXPOSE 443

CMD ["npm", "start"]