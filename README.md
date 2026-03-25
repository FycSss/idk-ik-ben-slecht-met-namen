# idk-ik-ben-slecht-met-namen

Eerste MVP-start van een privé file-sharing app (voor jou en vrienden), met account aanmaken en inloggen.

## Starten

```bash
npm install
npm start
```

Server draait dan op `http://localhost:3000`.

> Let op: zet `JWT_SECRET` in je omgeving voor een stabiele login-sessie over herstarts heen.
> Zonder `JWT_SECRET` gebruikt de app per proces een tijdelijke secret.
> Je kunt de token-duur instellen met `TOKEN_EXPIRES_IN` (standaard: `24h`).

## Beschikbare endpoints

- `GET /health` - healthcheck
- `POST /auth/register` - maak account aan
- `POST /auth/login` - log in en krijg JWT token
- `GET /me` - beveiligde endpoint (Bearer token vereist)

## Voorbeeld register/login

Register:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"vriend1","password":"sterkWachtwoord123"}'
```

Login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"vriend1","password":"sterkWachtwoord123"}'
```
