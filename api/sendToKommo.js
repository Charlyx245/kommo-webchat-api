export default async function handler(req, res) {
  // Habilitar CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Manejo del método OPTIONS (preflight request)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  // 🔐 Tu token de acceso largo de Kommo
  const accessToken = "AQUI_TU_TOKEN";
  const baseUrl = "https://sinocaydiseno.kommo.com";

  try {
    // Crear lead
    const leadResponse = await fetch(`${baseUrl}/api/v4/leads`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: `Lead Webchat - ${name}`,
        _embedded: {
          contacts: [{ first_name: name }]
        }
      })
    });

    const leadData = await leadResponse.json();
    const leadId = leadData.id || (leadData._embedded?.leads?.[0]?.id);

    if (!leadId) {
      throw new Error("No se pudo crear el lead");
    }

    // Agregar nota al lead
    const noteResponse = await fetch(`${baseUrl}/api/v4/leads/${leadId}/notes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        note_type: "common",
        params: { text: message }
      })
    });

    if (!noteResponse.ok) {
      throw new Error("Error al agregar nota");
    }

    res.status(200).json({ success: true, leadId });
  } catch (error) {
    console.error("Error al conectar con Kommo:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
