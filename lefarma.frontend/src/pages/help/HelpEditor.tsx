import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { helpService } from '@/services/helpService';
import type { CreateHelpArticleRequest } from '@/types/help.types';

const EMPTY_LEXICAL_JSON = {
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: '',
          },
        ],
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    version: 1,
  },
};

const MODULOS = [
  'General',
  'Catalogos',
  'Auth',
  'Notificaciones',
  'Profile',
  'Admin',
  'SystemConfig',
];

const TIPOS = [
  { value: 'usuario', label: 'Usuario Final' },
  { value: 'desarrollador', label: 'Desarrollador' },
  { value: 'ambos', label: 'Ambos' },
];

export default function HelpEditor() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateHelpArticleRequest>({
    titulo: '',
    contenido: JSON.stringify(EMPTY_LEXICAL_JSON, null, 2),
    resumen: '',
    modulo: 'General',
    tipo: 'usuario',
    categoria: '',
    orden: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.titulo.trim()) {
      alert('El título es obligatorio');
      return;
    }

    if (!formData.contenido.trim()) {
      alert('El contenido es obligatorio');
      return;
    }

    try {
      setIsLoading(true);
      await helpService.create(formData);
      navigate('/help');
    } catch (error: any) {
      console.error('Error creating article:', error);
      alert('Error al crear artículo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    field: keyof CreateHelpArticleRequest,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/help')}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Artículo de Ayuda</h1>
          <p className="text-muted-foreground">
            Crea un nuevo artículo para el centro de ayuda
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
        <div className="space-y-2">
          <Label htmlFor="titulo">
            Título <span className="text-destructive">*</span>
          </Label>
          <Input
            id="titulo"
            value={formData.titulo}
            onChange={(e) => handleChange('titulo', e.target.value)}
            placeholder="Ej: Cómo crear una nueva empresa"
            required
          />
        </div>

        {/* Resumen */}
        <div className="space-y-2">
          <Label htmlFor="resumen">Resumen</Label>
          <Textarea
            id="resumen"
            value={formData.resumen}
            onChange={(e) => handleChange('resumen', e.target.value)}
            placeholder="Breve descripción del artículo"
            rows={2}
          />
        </div>

        {/* Módulo y Tipo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="modulo">Módulo</Label>
            <Select
              value={formData.modulo}
              onValueChange={(value) => handleChange('modulo', value)}
            >
              <SelectTrigger id="modulo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODULOS.map((modulo) => (
                  <SelectItem key={modulo} value={modulo}>
                    {modulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Audiencia</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => handleChange('tipo', value)}
            >
              <SelectTrigger id="tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Categoría y Orden */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría (Opcional)</Label>
            <Input
              id="categoria"
              value={formData.categoria}
              onChange={(e) => handleChange('categoria', e.target.value)}
              placeholder="Ej: Guías de inicio"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orden">Orden</Label>
            <Input
              id="orden"
              type="number"
              value={formData.orden}
              onChange={(e) => handleChange('orden', parseInt(e.target.value) || 0)}
              min={0}
            />
          </div>
        </div>

        {/* Contenido (JSON) */}
        <div className="space-y-2">
          <Label htmlFor="contenido">
            Contenido (Lexical JSON) <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="contenido"
            value={formData.contenido}
            onChange={(e) => handleChange('contenido', e.target.value)}
            placeholder={JSON.stringify(EMPTY_LEXICAL_JSON, null, 2)}
            rows={10}
            className="font-mono text-sm"
            required
          />
          <p className="text-xs text-muted-foreground">
            Temporalmente editor de JSON. En próxima versión: editor visual con Lexical.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/help')}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Guardando...
              </>
            ) : (
              'Crear Artículo'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
