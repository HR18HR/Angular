


=========================
   CREARE UN NETWORK
=========================
// Chiamare la rete assolutamnte prova
docker network create prova

=========================
   CREARE CONTAINER MONGO
   (DA FARE PER PRIMO)
=========================
// Chiamare il container assolutamnte DB. 

docker run --network prova -d --name DB mongo

=========================
   AVVIO DEV CONTAINER
   IN VISUAL STUDIO CODE
=========================

------ BACKEND ------

1. Apri Visual Studio Code.
2. Vai alla cartella:
    directory_dove_si_trova_il_progetto\BACKEND\SRC_BACKEND

3. È già presente il file .devcontainer.json.
4. Appena aperta la cartella, clicca su "Reopen in Container" (in basso a destra).
5. Apri la bash integrata.
6. Esegui i comandi:

   npm install  
   npm run build  
   npm run start

------ FRONTEND ------

1. Apri Visual Studio Code.
2. Vai alla cartella:
   directory_dove_si_trova_il_progetto\FRONTEND\APP

3. È già presente il file .devcontainer.json.
4. Appena aperta la cartella, clicca su "Reopen in Container" (in basso a destra).
5. Apri la bash integrata.
6. Esegui i comandi:

   npm install  
   npm run start


=========================
     CREDENZIALI APP
=========================

EMAIL: admin
PASS:  1234

EMAIL: fly.com
PASS:  1234
