export default async function handler(req, res) {
  // Solo aceptamos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  }

  // Vercel lee la clave secreta que guardaste en Environment Variables
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'La clave API no se encontró en Vercel.' });
  }

  const { prompt } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Modelo oficial, rápido y económico
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    if (data.error) {
        return res.status(500).json({ success: false, error: data.error.message });
    }
    
    // Extraemos el texto de la IA
    const responseText = data.choices[0].message.content;

    // Se lo enviamos de vuelta a tu HTML
    res.status(200).json({ success: true, text: responseText });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
