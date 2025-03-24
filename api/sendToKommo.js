// /api/sendToKommo.js en Vercel (Node.js API Route)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { name, message } = req.body;
  if (!name || !message) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  // === CONFIGURACIÓN KOMMO ===
  const KOMMO_TOKEN = "PONER_TU_TOKEN_LARGO_ACÁ"; // Copia el token largo desde Kommo
  const KOMMO_DOMAIN = "https://sinocaydiseno.kommo.com";

  try {
    // 1. Crear el lead con contacto
    const leadResponse = await fetch(`${KOMMO_DOMAIN}/api/v4/leads/complex`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${KOMMO_TOKEN}`
      },
      body: JSON.stringify({
        name: `Lead Webchat - ${name}`,
        _embedded: {
          contacts: [
            {
              first_name: name,
              custom_fields_values: []
            }
          ]
        }
      })
    });

    const leadData = await leadResponse.json();
    const leadId = leadData._embedded?.leads?.[0]?.id;

    if (!leadId) {
      throw new Error("No se pudo crear el lead");
    }

    // 2. Enviar la nota al lead
    await fetch(`${KOMMO_DOMAIN}/api/v4/leads/${leadId}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${KOMMO_TOKEN}`
      },
      body: JSON.stringify({
        note_type: "common",
        params: {
          text: message
        }
      })
    });

    return res.status(200).json({ status: "Mensaje enviado a Kommo correctamente" });

  } catch (error) {
    console.error("Error al conectar con Kommo:", error);
    return res.status(500).json({ error: "Error al conectar con Kommo: " + error.message });
  }
}
