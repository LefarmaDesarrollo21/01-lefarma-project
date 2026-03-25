import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHelpStore } from '@/store/helpStore';

export default function HelpView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedArticle, isLoading, fetchArticleById } = useHelpStore();

  useEffect(() => {
    if (id) {
      fetchArticleById(parseInt(id));
    }
  }, [id, fetchArticleById]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/help')}
        className="mb-6"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Volver al centro de ayuda
      </Button>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      )}

      {/* Not Found State */}
      {!isLoading && !selectedArticle && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <h2 className="text-xl font-semibold mb-2">Artículo no encontrado</h2>
          <p className="text-muted-foreground mb-4">
            El artículo que buscas no existe o ha sido eliminado.
          </p>
          <Button variant="outline" onClick={() => navigate('/help')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver al centro de ayuda
          </Button>
        </div>
      )}

      {/* Article Content */}
      {!isLoading && selectedArticle && (
        <div className="space-y-6">
          {/* Title */}
          <h1 className="text-3xl font-bold">{selectedArticle.titulo}</h1>

          {/* Summary */}
          {selectedArticle.resumen && (
            <p className="text-lg text-muted-foreground">
              {selectedArticle.resumen}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>Módulo: {selectedArticle.modulo}</span>
            <span>•</span>
            <span>Tipo: {selectedArticle.tipo}</span>
            {selectedArticle.categoria && (
              <>
                <span>•</span>
                <span>Categoría: {selectedArticle.categoria}</span>
              </>
            )}
          </div>

          {/* Content */}
          <div className="border-t pt-6">
            <div className="mb-4 rounded-lg bg-muted p-4 text-sm">
              <p className="font-semibold mb-2">ℹ️ Contenido mostrado como JSON temporalmente</p>
              <p className="text-muted-foreground">
                En la próxima versión se implementará el renderizado visual con Lexical.
              </p>
            </div>

            {/* TODO: Implement Lexical renderer for rich content display */}
            <pre className="whitespace-pre-wrap rounded-lg bg-muted p-6 text-sm overflow-x-auto">
              {JSON.stringify(JSON.parse(selectedArticle.contenido), null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
