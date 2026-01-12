// src/types/express.d.ts
import { JWTPayload } from './dtos/auth.dto';

declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}