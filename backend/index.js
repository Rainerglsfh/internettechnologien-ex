import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import apiRouter from './api.js';

const app = express();
app.set('trust proxy', true);

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy8yBKM7qsdM/NhsUpjPPwFuhYxTTUmWddJ0J5pIpgVBnFuSBFkTk3AzvYJrFLaHjOahEbs6/WaRuR2TOgbtJi1SEcwNk/mArwGpeTzOGo3g6chiy4ScmEtHTK5+18Mz5+NDhQ6S23joDm6zpQLM2yoNIUDMCPctlb3IiuZl2LKqOCdqCiBExORGKkDKlU8UH5hTSc+C8sp0EOx/xoN0UoWVFjd74fu30Vvw4tS0QomUN19L0VMrS14HmOFbJQaEMGIWmP2hJhGjFd8GTqQmN6OJzeM3cG/VdYfAyeY9yBMxtGTkSvuqVH2NIEPnACtHU3IfGpRCk7GsQ9fJc4BB6yQIDAQAB
-----END PUBLIC KEY-----`;
const KEYCLOAK_BASE = 'https://keycloak.gawron.cloud/realms/webentwicklung';
const TOKEN_URL = `${KEYCLOAK_BASE}/protocol/openid-connect/token`;
const CLIENT_ID = 'todo-backend';
const CLIENT_SECRET = '1VNTlCvshrcZD4fm0eJjTOPecvwmt3Ly';

const jwtOptions = {
    jwtFromRequest: (req) => {
        let token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        if (!token && req.cookies) {
            token = req.cookies.token;
        }
        return token;
    },
    secretOrKey: PUBLIC_KEY,
    algorithms: ['RS256']
};

passport.use(
    new JwtStrategy(jwtOptions, (jwtPayload, done) => {
        if (!jwtPayload || !jwtPayload.sub) {
            return done(null, false);
        }
        return done(null, jwtPayload);
    })
);

app.use(express.static('../frontend'));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.get('/oauth_callback', async (req, res) => {
    const { code, state } = req.query;

    if (!code) {
        return res.status(400).send('Missing code parameter');
    }

    const forwardedProto = req.get('x-forwarded-proto') || req.protocol;
    const forwardedHost = req.get('x-forwarded-host') || req.get('host');
    const defaultCallbackUrl = `${forwardedProto}://${forwardedHost}/oauth_callback`;
    const callbackUrl = decodeURIComponent(req.cookies?.redirect_uri || defaultCallbackUrl);

    console.log('OAuth callback debug:', {
        host: req.get('host'),
        forwardedHost,
        protocol: req.protocol,
        forwardedProto,
        callbackUrl,
        state
    });

    try {
        const tokenResponse = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: callbackUrl
            })
        });

        if (!tokenResponse.ok) {
            const text = await tokenResponse.text();
            console.error('Token exchange failed:', tokenResponse.status, text);
            return res.status(502).send(`Token exchange failed: ${text}`);
        }

        const tokenData = await tokenResponse.json();
        const jwt = tokenData.access_token || tokenData.id_token;

        if (!jwt) {
            return res.status(502).send('No token received');
        }

        res.cookie('token', jwt, {
            httpOnly: true,
            sameSite: 'lax',
            secure: req.protocol === 'https'
        });

        if (state) {
            res.cookie('state', state, {
                httpOnly: false,
                sameSite: 'lax',
                secure: req.protocol === 'https'
            });
        }

        return res.redirect('/');
    } catch (error) {
        console.error('OAuth callback error:', error);
        return res.status(500).send('OAuth callback failed');
    }
});

app.use('/api', (req, res, next) => {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req) || req.cookies?.token;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    passport.authenticate('jwt', { session: false })(req, res, next);
});
app.use('/api', apiRouter);

app.listen(3000, () => {
    console.log('Server läuft auf http://localhost:3000');
});