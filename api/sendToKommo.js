export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  const token = process.env.KOMMO_TOKEN;
  const { username, message } = req.body;

  if (!username || !message) {
    return res.status(400).json({ error: "Missing username or message" });
  }

  try {
    // Crear lead en Kommo
    const leadResp = await fetch("https://sinocaydiseno.kommo.com/api/v4/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        name: `Lead Webchat - ${username}`,
        _embedded: {
          contacts: [
            { first_name: username }
          ]
        }
      })
    });

    const leadData = await leadResp.json();
    const leadId = leadData.id || leadData._embedded?.leads?.[0]?.id;

    if (!leadId) {
      return res.status(500).json({ error: "Failed to create lead in Kommo" });
    }

    // Enviar nota con mensaje
    await fetch(`https://sinocaydiseno.kommo.com/api/v4/leads/${leadId}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        note_type: "common",
        params: {
          text: message
        }
      })
    });

    return res.status(200).json({ success: true, leadId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}