let systemStatus = {
    active: true // true = encendido, false = apagado total
};

exports.handler = async function(event, context) {
    const path = event.path.replace('/.netlify/functions/keys', '');
    const method = event.httpMethod;
    
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    try {
        const body = event.body ? JSON.parse(event.body) : {};

        // 1. APAGAR O PRENDER EL SCRIPT DESDE TU PANEL WEB
        if (path === '/toggle' && method === 'POST') {
            if (body.adminPassword !== "MI_CLAVE_SECRETA_ADMIN") {
                return { statusCode: 403, headers, body: JSON.stringify({ success: false, message: "Contraseña incorrecta." }) };
            }
            systemStatus.active = body.active; // true o false
            return { statusCode: 200, headers, body: JSON.stringify({ success: true, active: systemStatus.active }) };
        }

        // 2. VER EL ESTADO ACTUAL PARA LA PÁGINA WEB
        if (path === '/status' && method === 'GET') {
            return { statusCode: 200, headers, body: JSON.stringify({ active: systemStatus.active }) };
        }

        // 3. VERIFICAR DESDE ROBLOX (Si está apagado, los bota con el mensaje)
        if (path === '/verify' && method === 'POST') {
            if (!systemStatus.active) {
                return { 
                    statusCode: 200, 
                    headers, 
                    body: JSON.stringify({ 
                        valid: false, 
                        message: "⛔ SCRIPT APAGADO: El creador ha desactivado el script temporalmente." 
                    }) 
                };
            }

            return { statusCode: 200, headers, body: JSON.stringify({ valid: true, message: "Script activo." }) };
        }

        return { statusCode: 404, headers, body: JSON.stringify({ message: "Ruta no encontrada" }) };

    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};
