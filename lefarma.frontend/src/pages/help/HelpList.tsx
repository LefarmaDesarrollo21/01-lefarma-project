import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { HelpSidebar } from '@/components/help/HelpSidebar';
import { HelpCard } from '@/components/help/HelpCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useHelpStore } from '@/store/helpStore';

export default function HelpList() {
  const { articles, isLoading, fetchAllArticles } = useHelpStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllArticles();
  }, []);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 border-r shrink-0">
        <HelpSidebar />
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Centro de Ayuda</h1>
            <Button onClick={() => navigate('/help/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Artículo
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3 rounded-lg border p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && articles.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
              <p className="text-muted-foreground mb-4">No hay artículos disponibles</p>
              <Button onClick={() => navigate('/help/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Crear primer artículo
              </Button>
            </div>
          )}

          {/* Articles Grid */}
          {!isLoading && articles.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <HelpCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
