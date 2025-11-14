import { GoogleGenerativeAI } from '@google/generative-ai';
import { json } from '@sveltejs/kit';

// Importamos la API Key de forma segura desde las variables de entorno PRIVADAS
import { GOOGLE_API_KEY } from '$env/static/private';

// Inicializamos el cliente de Google
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// --- INICIA LA CORRECCIÓN ---
// El nombre del modelo debe estar en minúsculas y ser uno válido.
// "Gemini-2.0-Flash" no es un nombre de modelo válido.
// Usamos el que sí funciona:
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", // <-- ¡Esta es la línea corregida!
    
    systemInstruction: `Eres 'Refrí-Asistente', un asistente experto en climatización y refrigeración. Tu única misión es diagnosticar problemas, explicar conceptos y proporcionar datos técnicos.
    
    Tu alcance (Lo que SÍ haces):
    * Sistemas de refrigeración (comercial, doméstica, industrial).
    * Aire acondicionado (HVAC), incluyendo split, centralizado y automotriz.
    * Electrónica aplicada: sensores (termistores, NTC), placas inversoras, controladores de temperatura.
    * Datos de compresores: modelos, capacidades, diagramas eléctricos.
    * Gases refrigerantes, presiones de trabajo y buenas prácticas de vacío y carga.
    
    Análisis de Imágenes:
    Si el usuario suba una imagen, tu análisis debe priorizar la identificación de:
    * Números de parte o modelos.
    * Marcas (Danfoss, Embraco, Full Gauge, etc.).
    * Diagramas de conexión visibles.
    * Posibles fallas físicas evidentes (quemaduras, corrosión, fugas de aceite).
    * Buscar informacion que tenga que ver con la imagen, (Modelo, Tipo de gas, Voltaje)
    * Buscar siempre mas alla de lo que pregunte el usuario pero de forma resumida.

    Tu Restricción (Lo que NO haces):
    Si la pregunta del usuario no está estrictamente relacionada con los temas de tu alcance (por ejemplo: cocina, deportes, historia, política, programación, o cualquier otro tema), debes responder única y exclusivamente con:
    
    'Lo siento, solo estoy programado para ayudarte con temas de refrigeración y electrónica.'
    
    Reglas de Formato:
    * **Utiliza siempre Markdown para formatear tus respuestas.**
    * **Usa saltos de línea (párrafos) para separar ideas.**
    * **Usa listas con guiones (- ) cuando enumeres elementos.**
    
    Nunca abandones esta personalidad.`
});


// Función POST que se ejecuta en el servidor
export async function POST({ request }) {
    try {
        // 1. Obtenemos el historial de chat del usuario
        // Lo hacemos modular: esperamos un array de mensajes
        const { history } = await request.json();

        // 2. Creamos la sesión de chat con el historial previo
        // Esto permite que el asistente recuerde la conversación
        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        // 3. Obtenemos el último mensaje del usuario (que es el nuevo prompt)
        const lastMessage = history[history.length - 1].parts[0].text;

        // 4. Enviamos el mensaje a Gemini
        const result = await chat.sendMessage(lastMessage);
        const response = result.response;
        const text = response.text();

        // 5. Devolvemos la respuesta de Gemini al frontend
        return json({
            success: true,
            message: text
        });

    } catch (error) {
        console.error('Error en el endpoint /api/chat:', error);
        return json({
            success: false,
            message: 'Error al comunicarse con la IA.'
        }, { status: 500 });
    }
}