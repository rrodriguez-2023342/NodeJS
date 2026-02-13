import jwt from 'jsonwebtoken';

export const validateJWT = (req, res, next) => {
    const jwtConfig ={
        secret: process.env.JWT_SECRET,
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE
    }

    if (!jwtConfig.secret) {
        console.error('Error de validacion JWT: JWT_SECRET no esta definido en las variables de entorno');
        return res.status(500).json({
            success: false,
            message: 'Configuracion del servidor invalida: falta JWT_SECRET'
        })
    }

    const token =
        req.header('x-token') ||
        req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No se proporciono un token de autenticacion',
            error: 'MISSING_TOKEN'
        })
    }

    try {
        const verifyOptions = {};
        if (jwtConfig.issuer) verifyOptions.issuer = jwtConfig.issuer;
        if (jwtConfig.audience) verifyOptions.audience = jwtConfig.audience;

        const decoded = jwt.verify(token, jwtConfig.secret, verifyOptions);

        if (decoded.role){
            console.warn(
                `Token sin campo 'role' para usuario ${decoded.sub}. Payload: `, JSON.stringify(decoded, null, 2)
            )
        }

        req.user = {
            id: decoded.sub, // userID del servicio de autenticacion
            jti: decoded.jti, // ID unico del token
            iat: decoded.iat, // Emitido en
            role: decoded.role || 'USER_ROLE' 
        }

        next();

    } catch (error) {
        console.error('Error de validacion JWT: ', error.message);

        if(error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'El token ha expirado',
                error: 'TOKEN_EXPIRED'
            })
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token de autenticacion invalido',
                error: 'INVALID_TOKEN'
            })
        }

        return res.status(500).json({
            success: false,
            message: 'Error al validar el token',
            error: 'JWT_VALIDATION_ERROR'
        })
    }
}