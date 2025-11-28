
# Notes API by Frida Eriksson

Serverless projekt med aws databas konstruktion.

## Usage

### Klona ner projekt

Kör följande i terminal:

```

cd NotesAPI-Frida
```

Kopiera miljövariabler (valfritt - fungerar även med fallback):

```
cp .env.example .env
```

Efter lyckad nerkloning, kör:

```
npm install
```

Deploya till AWS:

```
serverless deploy / sls deploy
```

### Test

i Insomnia/PostMan för att -

Skapa ny användare: 

```json
{
	"username": "Ditt Användarnamn",
	"password": "Lösenord",
	"firstname": "Förnamn",
	"lastname": "Efternamn"
}
```

Logga in användare: 

```json
{
	"username": "Ditt Användarnamn",
	"password": "Lösenord"
}
```

