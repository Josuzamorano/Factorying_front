import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para sincronizar estado con localStorage
 * @param key - Clave en localStorage
 * @param initialValue - Valor inicial si no existe en localStorage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Función para obtener el valor inicial
  const getStoredValue = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  // Estado local
  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // Función para actualizar el valor
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Permitir funciones como en useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Guardar en estado
        setStoredValue(valueToStore);

        // Guardar en localStorage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));

        // Disparar evento para sincronización entre tabs
        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: JSON.stringify(valueToStore),
          })
        );
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Función para eliminar el valor
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Escuchar cambios de otras tabs/ventanas
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue) as T);
        } catch {
          console.warn(`Error parsing storage event for key "${key}"`);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
