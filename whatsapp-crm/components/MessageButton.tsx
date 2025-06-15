'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Message {
  text: string;
  timestamp: string;
}

export function MessageButton() {
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessage = async () => {
    try {
      console.log('Iniciando petición GET a /api/obtenerMensaje...');
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3001/api/obtenerMensaje');
      console.log('Status de la respuesta:', response.status);
      console.log('Headers de la respuesta:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Datos recibidos:', data);
      setMessage(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error al obtener el mensaje:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Button 
        onClick={fetchMessage}
        disabled={loading}
        className="bg-green-500 hover:bg-green-600"
      >
        {loading ? 'Cargando...' : 'Obtener Mensaje'}
      </Button>

      {error && (
        <div className="text-red-500 text-sm">
          Error: {error}
        </div>
      )}

      {message && (
        <Card className="w-full max-w-md p-4 bg-gray-100 rounded-2xl relative">
          <div className="flex flex-col">
            <p className="text-gray-800">{message.text}</p>
            <span className="text-xs text-gray-500 mt-2">{message.timestamp}</span>
          </div>
          <div className="absolute -bottom-2 left-4 w-4 h-4 bg-gray-100 transform rotate-45"></div>
        </Card>
      )}
    </div>
  );
} 