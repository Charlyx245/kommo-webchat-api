export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: 'Faltan datos: name o message' });
  }

  const KOMMO_TOKEN = "AQUÍ_VA_TU_TOKEN_DE_LARGA_DURACIÓN";
  const KOMMO_DOMAIN = "https://sinocaydiseno.kommo.com";

  try {
    // Crear nuevo lead en Kommo
    const leadResponse = await fetch(`${KOMMO_DOMAIN}/api/v4/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KOMMO_TOKEN}`
      },
      body: JSON.stringify({
        name: `Webchat - ${name}`,
        _embedded: {
          contacts: [{ first_name: name }]
        }
      })
    });

    const leadData = await leadResponse.json();

    const leadId = leadData.id || (leadData._embedded && leadData._embedded.leads?.[0]?.id);

    if (!leadId) {
      throw new Error("No se pudo crear el lead");
    }

    // Enviar nota
    await fetch(`${KOMMO_DOMAIN}/api/v4/leads/${leadId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KOMMO_TOKEN}`
      },
      body: JSON.stringify({
        note_type: 'common',
        params: { text: message }
      })
    });

    return res.status(200).json({ status: 'Mensaje enviado a Kommo' });
  } catch (error) {
    console.error("Error al conectar con Kommo:", error);
    return res.status(500).json({ error: 'Error al conectar con Kommo: ' + error.message });
  }
}
