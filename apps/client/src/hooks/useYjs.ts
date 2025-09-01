import { useEffect, useState, useCallback } from 'react';

export const useYjs = (canvasId: string, initialData?: string) => {
  const [shapes, setShapes] = useState<any[]>([]);
  const [yShapes, setYShapes] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<any>(null);
  const [ydoc, setYdoc] = useState<any>(null);
  const [idCounter, setIdCounter] = useState<any>(null);

  const generateUniqueId = useCallback((): string => {
    if (!ydoc || !idCounter) {
      return `local-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }

    try {
      let newId = '';
      ydoc.transact(() => {
        const currentValue = idCounter.get('value') || 0;
        const newValue = currentValue + 1;
        idCounter.set('value', newValue);
        
        newId = `${ydoc.clientID}-${newValue}`;
      });
      return newId;
    } catch (err) {
      console.error('Error generating ID:', err);
      return `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
  }, [ydoc, idCounter]);

  const updateShape = useCallback((index: number, updatedProps: any) => {
    if (yShapes && index >= 0 && index < yShapes.length) {
      try {
        yShapes.doc?.transact(() => {
          const yMap = yShapes.get(index);
          Object.entries(updatedProps).forEach(([key, value]) => {
            yMap.set(key, value);
          });
        });
      } catch (err) {
        console.error('Error updating shape:', err);
      }
    }
  }, [yShapes]);

  // Add a function to update shape by ID (useful for pencil tool)
  const updateShapeById = useCallback((shapeId: string, updatedProps: any) => {
    if (yShapes) {
      try {
        yShapes.doc?.transact(() => {
          for (let i = 0; i < yShapes.length; i++) {
            const yMap = yShapes.get(i);
            if (yMap.get('id') === shapeId) {
              Object.entries(updatedProps).forEach(([key, value]) => {
                yMap.set(key, value);
              });
              break;
            }
          }
        });
      } catch (err) {
        console.error('Error updating shape by ID:', err);
      }
    }
  }, [yShapes]);

  useEffect(() => {
    if (!canvasId) return;

    const initializeYjs = async () => {
      try {
        // Dynamically import the provider
        const { SocketIOProvider } = await import('y-socket.io');
        const Y = await import('yjs');
        
        const ydocInstance = new Y.Doc();
        setYdoc(ydocInstance);
        
        const providerInstance = new SocketIOProvider(
          'ws://localhost:5000',
          canvasId,
          ydocInstance,
          {}
        );

        setProvider(providerInstance);

        const yArray = ydocInstance.getArray('shapes');
        setYShapes(yArray);

        const counter = ydocInstance.getMap('idCounter');
        if (!counter.has('value')) {
          counter.set('value', 0);
        }
        setIdCounter(counter);

        
        if (initialData && yArray.length === 0) {
          try {
            const parsedData = JSON.parse(initialData);
            ydocInstance.transact(() => {
              parsedData.forEach((shape: any) => {
                const yMap = new Y.Map();
                Object.entries(shape).forEach(([key, value]) => {
                  yMap.set(key, value);
                });
                yArray.push([yMap]);
              });
            });
          } catch (e) {
            console.error('Error parsing initial data:', e);
          }
        }

        const observer = () => {
          try {
            setShapes(yArray.toArray().map((shape: any) => {
              return shape && typeof shape.toJSON === 'function' 
                ? shape.toJSON() 
                : shape;
            }));
          } catch (e) {
            console.error('Error converting shapes:', e);
          }
        };
        
        yArray.observe(observer);
        observer();

        providerInstance.on('status', (event: any) => {
          console.log('[Y.js] Provider status:', event.status);
          setIsConnected(event.status === 'connected');
          if (event.status === 'disconnected') {
            setError('Disconnected from collaboration server');
          } else {
            setError(null);
          }
        });

        providerInstance.on('connection-error', (error: any) => {
          console.error('[Y.js] Connection error:', error);
          setError('Failed to connect to collaboration server');
          setIsConnected(false);
        });

      } catch (err) {
        console.error('Failed to initialize Y.js:', err);
        setError('Failed to initialize collaboration');
      }
    };

    initializeYjs();

    return () => {
      if (provider) {
        provider.disconnect();
      }
    };
  }, [canvasId, initialData]);

  const addShape = useCallback((shapeData: any) => {
    if (yShapes) {
      try {
        yShapes.doc?.transact(() => {
          const Y = require('yjs');
          const yMap = new Y.Map();
          Object.entries(shapeData).forEach(([key, value]) => {
            yMap.set(key, value);
          });
          yShapes.push([yMap]);
        });
      } catch (err) {
        console.error('Error adding shape:', err);
      }
    }
  }, [yShapes]);

return { shapes, addShape, error, isConnected, generateUniqueId };
};