# idk-ik-ben-slecht-met-namen

Eerste MVP-start van een privé file-sharing app (voor jou en vrienden), met account aanmaken en inloggen.

## Kan dit een `.exe` zijn?

Kort antwoord: **niet direct**.  
Dit project is nu een **Node.js backend server** (`src/server.js`), geen Windows desktop-app met grafische interface.

Je kunt deze app dus het beste draaien met Node.js (stappen hieronder).  
Een echte `.exe` bouwen kan later eventueel met extra tooling, maar dat is nu nog niet ingebouwd in dit project.

## Starten

```bash
npm install
npm start
```

Server draait dan op `http://localhost:3000`.

> Let op: zet `JWT_SECRET` in je omgeving voor een stabiele login-sessie over herstarts heen.
> Zonder `JWT_SECRET` gebruikt de app per proces een tijdelijke secret.
> Je kunt de token-duur instellen met `TOKEN_EXPIRES_IN` (standaard: `24h`).

## Installeren en openen op Windows

1. **Installeer Node.js (LTS)**
   - Download via: https://nodejs.org
   - Controleer in PowerShell:
     ```powershell
     node -v
     npm -v
     ```

2. **Download dit project**
   - Via GitHub: klik op **Code > Download ZIP** en pak het uit  
   - Of via git:
     ```bash
     git clone https://github.com/FycSss/idk-ik-ben-slecht-met-namen.git
     cd idk-ik-ben-slecht-met-namen
     ```

3. **Installeer dependencies**
   ```bash
   npm install
   ```

4. **Start de app**
   ```bash
   npm start
   ```

5. **Openen/gebruiken**
   - Server draait op: `http://localhost:3000`
   - Healthcheck: open `http://localhost:3000/health` in je browser

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
