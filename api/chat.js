export default async function handler(req, res) {
  // 1. Vercel busca la clave en su configuración interna
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'Configuración incompleta en Vercel.' });
  }

  // 2. Recibe el mensaje del usuario
  const { prompt } = req.body;

  try {
    // 3. Habla con ChatGPT de forma segura
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // El modelo más rápido y barato
        messages: [
          { role: "system", content: "Eres Creatik IA, experto en audiovisuales de El Salvador. Responde de forma creativa, amable y en máximo 3 líneas. No uses menús numerados." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();
    
    if (data.error) throw new Error(data.error.message);

    // 4. Envía la respuesta de vuelta a tu página
    res.status(200).json({ success: true, text: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
