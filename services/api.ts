export interface APIResponse {
    isMalicious: boolean;
  }

  export const checkURL = async (url: string): Promise<APIResponse> => {
    try {
      const response = await fetch('https://c398-38-25-22-133.ngrok-free.app/api/v1/qrscan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Error al comunicarse con el servidor');
      }

      return await response.json();
    } catch (error) {
      console.error(error);
      throw new Error('No se pudo completar la solicitud');
    }
  };
