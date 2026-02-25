export default async function handler(req, res) {
    // Solo permitimos peticiones POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { messages } = req.body;

        // Llamada segura a OpenAI desde los servidores de Vercel
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Rápido y económico
                messages: messages,
                temperature: 0.7
            })
        });

        const data = await response.json();

        // Si OpenAI tira error (ej. sin saldo)
        if (data.error) {
            console.error("OpenAI Error:", data.error);
            return res.status(500).json({ error: data.error.message });
        }

        // Enviamos la respuesta de vuelta a tu web
        res.status(200).json({ reply: data.choices[0].message.content });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Error de comunicación con la IA" });
    }
}
