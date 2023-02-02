import jwt from "jsonwebtoken";

export const jwtSecret = "dawj312uh3sjahi31";

export default function encodeJWT(data){
    return jwt.sign(data, jwtSecret);
}