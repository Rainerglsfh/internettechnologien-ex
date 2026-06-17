import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import apiRouter from './api.js';

const app = express();

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy8yBKM7qsdM/NhsUpjPPwFuhYxTTUmWddJ0J5pIpgVBnFuSBFkTk3AzvYJrFLaHjOahEbs6/WaRuR2TOgbtJi1SEcwNk/mArwGpeTzOGo3g6chiy4ScmEtHTK5+18Mz5+NDhQ6S23joDm6zpQLM2yoNIUDMCPctlb3IiuZl2LKqOCdqCiBExORGKkDKlU8UH5hTSc+C8sp0EOx/xoN0UoWVFjd74fu30Vvw4tS0QomUN19L0VMrS14HmOFbJQaEMGIWmP2hJhGjFd8GTqQmN6OJzeM3cG/VdYfAyeY9yBMxtGTkSvuqVH2NIEPnACtHU3IfGpRCk7GsQ9fJc4BB6yQIDAQAB
-----END PUBLIC KEY-----`;

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

app.use('/api', (req, res, next) => {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req) || req.cookies?.token;

    if (!token) {
        req.user = null;
        return next();
    }

    passport.authenticate('jwt', { session: false })(req, res, next);
});
app.use('/api', apiRouter);

app.listen(3000, () => {
    console.log('Server läuft auf http://localhost:3000');
});