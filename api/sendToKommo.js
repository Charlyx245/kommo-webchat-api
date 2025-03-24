export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const KOMMO_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjYyMzkzNTExYmMxMzM5OGRlMjM0YTYwYTE2ODExZGVhOTQ0ZWYyZWYxNDliYzU3ZjE2NTk3NGExZDg5ODhiN2MzOWNmOWFiMmJjZWVhZmM0In0.eyJhdWQiOiI1NTNjNmYwYy1iNmIyLTRjMDUtOGM1Yi01YTZhNTVlMDFkOTEiLCJqdGkiOiI2MjM5MzUxMWJjMTMzOThkZTIzNGE2MGExNjgxMWRlYTk0NGVmMmVmMTQ5YmM1N2YxNjU5NzRhMWQ4OTg4YjdjMzljZjlhYjJiY2VlYWZjNCIsImlhdCI6MTc0Mjc4OTczMywibmJmIjoxNzQyNzg5NzMzLCJleHAiOjE3NDg2NDk2MDAsInN1YiI6IjEyOTE0Mjg3IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjM0MzQ1MjMxLCJiYXNlX2RvbWFpbiI6ImtvbW1vLmNvbSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiYmVkYjdjMjYtMDA1Yy00MDFjLWI1YTgtYmI2YjRhYWNiNGYxIiwiYXBpX2RvbWFpbiI6ImFwaS1jLmtvbW1vLmNvbSJ9.DjHRhApBqwRKBgB3MpXBkEat9HKHb2diqNvn5I1Jt_1w0PNqtUYeSnREXDRxLZACwJ2XqqdV49ZlMxkiM-FuOZFMFz0ju0vLytlERZOpDNg9Gt7VV7BjwzsVsi5Lamc_8ELbUkPbWnVXsQ1KTw4BQ5PkSaLbzUkpBxZ4exQGO6b-C8Q63xn7-dHksuvdu95wCP8ZaiUVe4rTiu2qHx--OusdbCMQnhQdmeSgW9QLuYHOsw7yFZ3hH5206Detx3VuoseP6D8P8wsGONrXKOnzFJT1EhKdFSJlDTZWQUzTIwF5XGNN36X6PaGlm9a0htyeW9IwRLHg3ZqEUSH7P8LQyA";
  const KOMMO_DOMAIN = "https://sinocaydiseno.kommo.com";

  try {
    // 1. Crear LEAD
    const leadResponse = await fetch(`${KOMMO_DOMAIN}/api/v4/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${KOMMO_TOKEN}`,
      },
      body: JSON.stringify({
        name: [`Lead desde Webchat - ${name}`],
        _embedded: {
          contacts: [
            {
              first_name: name
            }
          ]
        }
      }),
    });

    const leadData = await leadResponse.json();

    if (!leadResponse.ok || !leadData._embedded?.leads?.[0]?.id) {
      throw new Error("No se pudo crear el lead");
    }

    const leadId = leadData._embedded.leads[0].id;

    // 2. Enviar nota al lead
    const noteResponse = await fetch(`${KOMMO_DOMAIN}/api/v4/leads/${leadId}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${KOMMO_TOKEN}`,
      },
      body: JSON.stringify({
        note_type: "common",
        params: { text: message }
      }),
    });

    if (!noteResponse.ok) {
      throw new Error("No se pudo enviar la nota");
    }

    return res.status(200).json({ status: "Mensaje enviado correctamente", leadId });
  } catch (err) {
    console.error("Error al conectar con Kommo:", err);
    return res.status(500).json({ error: "Error al conectar con Kommo" });
  }
}
