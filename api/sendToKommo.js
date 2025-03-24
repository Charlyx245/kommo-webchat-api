export default async function handler(req, res) {
  // Permitir solicitudes CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Responder a preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Solo permitimos POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  try {
    // Crear lead
    const response = await fetch("https://sinocaydiseno.kommo.com/api/v4/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjNlMTVjZjY5NWFmYmNhZDU2YzBkZDAwMzhhNTQyYzA3NTM0NDg4YzRmMjM5YWQ4YzBlNDhiMTZlYTIzYmJlMDdiODE5YjJmNDg1MjA0ZjVhIn0.eyJhdWQiOiI1NTNjNmYwYy1iNmIyLTRjMDUtOGM1Yi01YTZhNTVlMDFkOTEiLCJqdGkiOiIzZTE1Y2Y2OTVhZmJjYWQ1NmMwZGQwMDM4YTU0MmMwNzUzNDQ4OGM0ZjIzOWFkOGMwZTQ4YjE2ZWEyM2JiZTA3YjgxOWIyZjQ4NTIwNGY1YSIsImlhdCI6MTc0Mjc5MTE4NSwibmJmIjoxNzQyNzkxMTg1LCJleHAiOjE3ODU0NTYwMDAsInN1YiI6IjEyOTE0Mjg3IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjM0MzQ1MjMxLCJiYXNlX2RvbWFpbiI6ImtvbW1vLmNvbSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiMjQ3MDEzMTMtNDE2Yy00ODdlLWI1YzktY2MzODhmYzNiZTAxIiwiYXBpX2RvbWFpbiI6ImFwaS1jLmtvbW1vLmNvbSJ9.cdia32dHopUTkqhiBUhmONzydTFyxBCCjfY0gXWQhT3oJru9w03QEMEnZTrkLykAG_-TD-GEW4NlXcOek89zgkKv-5YOnEepQmkMhDtXX9uspTNo7KvluDDf_r8sNqq8uMuC-iuLHN0_wGGe7nf45o0kQgcHZ1r8-z2UhxKEto_WULzW5WLaNafnp7sqWR-a4hXrFI3HSuWnG4CO1GT1A8kCjdBS2AlQwLhjMVBXS3Cb7953QM4yxHHg9kLTFwvA4PdsrWIGgUoFLxw2fg_3jIKzwTXl1G5Eiccq8QWPQ7Wjh5BrF0Pyu7sHrZYte2CVU5kyC5stEe87xwMf98qlRg"
      },
      body: JSON.stringify({
        name: [`Lead Webchat - ${name}`],
        _embedded: {
          contacts: [
            {
              first_name: name
            }
          ]
        }
      })
    });

    const data = await response.json();

    const leadId = data._embedded?.leads?.[0]?.id;
    if (!leadId) {
      throw new Error("No se pudo crear el lead");
    }

    // Agregar nota al lead
    await fetch(`https://sinocaydiseno.kommo.com/api/v4/leads/${leadId}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjNlMTVjZjY5NWFmYmNhZDU2YzBkZDAwMzhhNTQyYzA3NTM0NDg4YzRmMjM5YWQ4YzBlNDhiMTZlYTIzYmJlMDdiODE5YjJmNDg1MjA0ZjVhIn0.eyJhdWQiOiI1NTNjNmYwYy1iNmIyLTRjMDUtOGM1Yi01YTZhNTVlMDFkOTEiLCJqdGkiOiIzZTE1Y2Y2OTVhZmJjYWQ1NmMwZGQwMDM4YTU0MmMwNzUzNDQ4OGM0ZjIzOWFkOGMwZTQ4YjE2ZWEyM2JiZTA3YjgxOWIyZjQ4NTIwNGY1YSIsImlhdCI6MTc0Mjc5MTE4NSwibmJmIjoxNzQyNzkxMTg1LCJleHAiOjE3ODU0NTYwMDAsInN1YiI6IjEyOTE0Mjg3IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjM0MzQ1MjMxLCJiYXNlX2RvbWFpbiI6ImtvbW1vLmNvbSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiMjQ3MDEzMTMtNDE2Yy00ODdlLWI1YzktY2MzODhmYzNiZTAxIiwiYXBpX2RvbWFpbiI6ImFwaS1jLmtvbW1vLmNvbSJ9.cdia32dHopUTkqhiBUhmONzydTFyxBCCjfY0gXWQhT3oJru9w03QEMEnZTrkLykAG_-TD-GEW4NlXcOek89zgkKv-5YOnEepQmkMhDtXX9uspTNo7KvluDDf_r8sNqq8uMuC-iuLHN0_wGGe7nf45o0kQgcHZ1r8-z2UhxKEto_WULzW5WLaNafnp7sqWR-a4hXrFI3HSuWnG4CO1GT1A8kCjdBS2AlQwLhjMVBXS3Cb7953QM4yxHHg9kLTFwvA4PdsrWIGgUoFLxw2fg_3jIKzwTXl1G5Eiccq8QWPQ7Wjh5BrF0Pyu7sHrZYte2CVU5kyC5stEe87xwMf98qlRg"
      },
      body: JSON.stringify({
        note_type: "common",
        params: {
          text: message
        }
      })
    });

    return res.status(200).json({ status: "Mensaje enviado correctamente" });

  } catch (error) {
    console.error("Error al conectar con Kommo:", error);
    return res.status(500).json({ message: "Error al conectar con Kommo" });
  }
}
