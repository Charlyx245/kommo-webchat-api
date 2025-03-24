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
  const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjU5ZWFkYWViYmM0MTA5ZDc0ZTBhYjJmYzM5ZDg2MDU4M2QzY2RhOWE1ZDI4Y2UzMWFjYjYyMGQ5OWE2N2UyNDU0YTVmMTdhYmM0ZGU5ZTNiIn0.eyJhdWQiOiI1NTNjNmYwYy1iNmIyLTRjMDUtOGM1Yi01YTZhNTVlMDFkOTEiLCJqdGkiOiI1OWVhZGFlYmJjNDEwOWQ3NGUwYWIyZmMzOWQ4NjA1ODNkM2NkYTlhNWQyOGNlMzFhY2I2MjBkOTlhNjdlMjQ1NGE1ZjE3YWJjNGRlOWUzYiIsImlhdCI6MTc0Mjc4ODc1NCwibmJmIjoxNzQyNzg4NzU0LCJleHAiOjE3ODAxODU2MDAsInN1YiI6IjEyOTE0Mjg3IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjM0MzQ1MjMxLCJiYXNlX2RvbWFpbiI6ImtvbW1vLmNvbSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiNmYwODg4OTQtNmIxNS00OTNiLTkwNTUtMGQwM2IwMTFlMGFkIiwiYXBpX2RvbWFpbiI6ImFwaS1jLmtvbW1vLmNvbSJ9.ZVDYvWT-7h7eB68ecrB7214z90B3iCw7U29QdSedt4NSZbulYsSD4rktkuQUxEl85mt_0Bo6La1_PxYGqBYn16EpFNxqZ9OtCNzJXiXHfD8oIsBrw1mstHMfioYDzAZ8UrJ3Qk0nm1gr1QNu51pZXIhIIxa-5sNgWuWgKaR0EyYenW5FbEGymc3ACzZZ1QXGEfHDka3VjmDNYBxGp0IFdzh1RH37Tuhw_xuEr7U2gCMPUWOiaMkvtOs1_6lvf0XzWPS0pZ44z8T5OeapmKLVrPdWDYPf3dxApIL0jncQTOXH43IboI_YlAuFpQRfElzorOgCrIkAf50kw_LWCKbM7A";
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
