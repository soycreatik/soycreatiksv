export default async function handler(req, res) {
  // Solo aceptamos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  }

  // Vercel lee la clave secreta que guardaste en el Paso 1
  const apiKey = process.env.OPENAI_API_KEY;
  const { prompt } = req.body;

  try {
    // Nos conectamos a OpenAI con la estructura exacta de tu DOC.html
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        "model": "gpt-5-nano",
        "input": prompt,
        "store": true
      })
    });

    const data = await response.json();

    if (data.error) {
        return res.status(500).json({ success: false, error: data.error.message });
    }
    
    // Filtro inteligente para extraer solo el texto
    let responseText = "";
    if (data.output && typeof data.output === 'string') { responseText = data.output; } 
    else if (data.output && data.output.content && Array.isArray(data.output.content)) { responseText = data.output.content.map(c => c.text || c.text?.value || "").join(""); } 
    else if (data.choices && data.choices.length > 0) { responseText = data.choices[0].text || (data.choices[0].message && data.choices[0].message.content) || ""; } 
    else if (data.response) { responseText = data.response; } 
    else {
        const findText = (obj) => {
            if (!obj || typeof obj !== 'object') return null;
            if (obj.text && typeof obj.text === 'string') return obj.text;
            if (obj.content && typeof obj.content === 'string') return obj.content;
            for (let key in obj) { let r = findText(obj[key]); if (r) return r; }
            return null;
        };
        responseText = findText(data) || "Respuesta recibida pero sin formato de texto.";
    }

    // Devolvemos el texto limpio a tu HTML
    res.status(200).json({ success: true, text: responseText });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
