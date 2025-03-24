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
  const KOMMO_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjU5ZWFkYWViYmM0MTA5ZDc0ZTBhYjJmYzM5ZDg2MDU4M2QzY2RhOWE1ZDI4Y2UzMWFjYjYyMGQ5OWE2N2UyNDU0YTVmMTdhYmM0ZGU5ZTNiIn0.eyJhdWQiOiI1NTNjNmYwYy1iNmIyLTRjMDUtOGM1Yi01YTZhNTVlMDFkOTEiLCJqdGkiOiI1OWVhZGFlYmJjNDEwOWQ3NGUwYWIyZmMzOWQ4NjA1ODNkM2NkYTlhNWQyOGNlMzFhY2I2MjBkOTlhNjdlMjQ1NGE1ZjE3YWJjNGRlOWUzYiIsImlhdCI6MTc0Mjc4ODc1NCwibmJmIjoxNzQyNzg4NzU0LCJleHAiOjE3ODAxODU2MDAsInN1YiI6IjEyOTE0Mjg3IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjM0MzQ1MjMxLCJiYXNlX2RvbWFpbiI6ImtvbW1vLmNvbSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiNmYwODg4OTQtNmIxNS00OTNiLTkwNTUtMGQwM2IwMTFlMGFkIiwiYXBpX2RvbWFpbiI6ImFwaS1jLmtvbW1vLmNvbSJ9.ZVDYvWT-7h7eB68ecrB7214z90B3iCw7U29QdSedt4NSZbulYsSD4rktkuQUxEl85mt_0Bo6La1_PxYGqBYn16EpFNxqZ9OtCNzJXiXHfD8oIsBrw1mstHMfioYDzAZ8UrJ3Qk0nm1gr1QNu51pZXIhIIxa-5sNgWuWgKaR0EyYenW5FbEGymc3ACzZZ1QXGEfHDka3VjmDNYBxGp0IFdzh1RH37Tuhw_xuEr7U2gCMPUWOiaMkvtOs1_6lvf0XzWPS0pZ44z8T5OeapmKLVrPdWDYPf3dxApIL0jncQTOXH43IboI_YlAuFpQRfElzorOgCrIkAf50kw_LWCKbM7A"; // Copia el token largo desde Kommo
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
