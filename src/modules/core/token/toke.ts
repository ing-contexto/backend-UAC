import jwt, { JwtPayload } from "jsonwebtoken";

type AccessPayload = JwtPayload & { sub: string; email: string };

const stripBearer = (t: string) => (t.startsWith("Bearer ") ? t.slice(7) : t);

export class authToken {
    private readonly secret: string;
    private readonly issuer: string;
    private readonly audience: string;

    constructor(secret = process.env.SECRET, issuer = "uac-oaxaca.xyz", audience = "uac-auth") {
        if (!secret || secret.length < 6) throw new Error("JWT secret missing/weak");
        this.secret = secret;
        this.issuer = issuer;
        this.audience = audience;
    }

    makeAccessToken(id: number, email: string): string {
        return jwt.sign(
            { sub: String(id), email },
            this.secret,
            { algorithm: "HS256", expiresIn: "1h", issuer: this.issuer, audience: this.audience }
        );
    }

    verifyAndGetPayload(token: string): AccessPayload | null {
        try {
            const payload = jwt.verify(
                stripBearer(token),
                this.secret,
                { algorithms: ["HS256"], issuer: this.issuer, audience: this.audience, clockTolerance: 5 }
            ) as JwtPayload;
            const sub = String(payload.sub ?? "");
            const email = String((payload as any).email ?? "");
            if (!sub || !email) return null;
            return { ...payload, sub, email };
        } catch {
            return null;
        }
    }

    isValid(token: string): boolean {
        return this.verifyAndGetPayload(token) !== null;
    }
}
