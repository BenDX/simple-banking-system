# Simple Banking System
Just a restful simple banking system

## Usage
### Options 1. Local Execute
Install the dependence
```bash
npm install
```
Start the node server
```bash
npm start
```

### Options 2. Use Docker
```bash
docker build --rm -t banking-system .
docker run -p 3000:3000 banking-system
```

## TODO
* add account password (hash with bcrypt)
* add fromAccountId & toAccountId to transaction model and relation place
* add decimal handle (with bignumber.js)
* apply account id to relation place
* support for multi language 
* use SQL db to persistence data