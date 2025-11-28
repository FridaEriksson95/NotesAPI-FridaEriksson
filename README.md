
# Notes API by Frida Eriksson

Serverless REST-API projekt med AWS databas konstruktion

## Funktionalitet: 
- Registrering och inloggning med JWT
- Skapa, hämta, redigera och radera anteckningar
- Återställa raderade anteckningar
- Automatisk permanent radering efter 5 dagar med DynamoDB TTL på 'expiresAt'
- Validering och säkerhetsmeddelanden i egen fil
  
## Kör projektet 

### Klona ner projekt

Kör följande i terminal:

```bash
git clone https://github.com/FridaEriksson95/NotesAPI-FridaEriksson.git
cd NotesAPI-FridaEriksson
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
### Autentisering - såhär använder du JWT token
1. Skapa en användare
2. Logga in din användare
3. I svaret får du ett JWT token tillbaka:
```json
{
	 "success": true,
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```
4. Lägg denna token i **"Auth"** - **"Bearer Token"** - Enabled och klista in din token
   
### Alla Endpoints *(testa med bifogat Insomnia_Frida.yaml export)*

I Insomnia/PostMan för att -

- *POST /signup* - **Skapa ny användare**: 
(autentisering - **NEJ**)

```json
{
	"username": "Ditt Användarnamn",
	"password": "Lösenord",
	"firstname": "Förnamn",
	"lastname": "Efternamn"
}
```

- *POST /login* **Logga in användare**: 
(autentisering - **NEJ**)

```json
{
	"username": "Ditt Användarnamn",
	"password": "Lösenord"
}
```
- *POST /notes* **Skapa ny anteckning**: 
(autentisering - **JA**)

```json
{
	"title": "Titel",
	"text": "Din anteckning"
}
```
- *GET /notes* **Hämta anteckningar**: 
(autentisering - **JA**)

- *PATCH /notes/{id}* **Redigera anteckning**: 
(autentisering - **JA**)

```json
{
	/* båda / antingen eller: */
	"title": "Titel",
	"text": "Din anteckning"
}
```
- *DELETE /notes/{id}* **Soft deletea en anteckning**: 
(autentisering - **JA**)

	*id på specifik anteckning krävs*

- *GET /deleted-notes* **Hämta alla 'raderade' anteckningar**: 
(autentisering - **JA**)

- *POST /notes/{id}/restore* **Återställ anteckning**: 
(autentisering - **JA**)

	*id på specifik anteckning krävs*
