import { useEffect, useState, useMemo } from 'react';
import { FileText, Menu } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { helpService } from '@/services/helpService';
import type { HelpArticle } from '@/types/help.types';


export default function PublicHelpList() {
  usePageTitle('Ayuda', 'Centro de ayuda y soporte');

  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const data = await helpService.getPublicForUser(selectedModule || undefined);
        setArticles(data);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, [selectedModule]);

  const filteredArticles = useMemo(() => {
    if (!articles?.length) return [];
    if (!selectedModule) return articles;
    return articles.filter(a => a.modulo === selectedModule);
  }, [articles, selectedModule]);

  const selectedArticle = useMemo<HelpArticle | null>(() => {
    if (!filteredArticles?.length) return null;
    if (!selectedArticleId) {
      return filteredArticles[0];
    }
    return filteredArticles.find((a) => a.id === selectedArticleId) ?? null;
  }, [filteredArticles, selectedArticleId]);

  useEffect(() => {
    if (!filteredArticles?.length) {
      setSelectedArticleId(null);
    } else if (!selectedArticleId) {
      setSelectedArticleId(filteredArticles[0].id);
    } else if (!filteredArticles.some((a) => a.id === selectedArticleId)) {
      setSelectedArticleId(filteredArticles[0].id);
    }
  }, [filteredArticles, selectedArticleId]);

  const handleModuleSelect = (modulo: string) => {
    setSelectedArticleId(null);
    setSelectedModule(modulo);
    setIsSidebarOpen(false);
  };

  const modules = useMemo(() => {
    if (!articles?.length) return [];
    const moduleSet = new Set(articles.map(a => a.modulo).filter(Boolean));
    return Array.from(moduleSet).sort();
  }, [articles]);

  if (isLoading && !articles?.length) {
    return (
      <div className="flex flex-col md:flex-row h-[calc(100vh-7rem)]">
        <div className="hidden md:block w-64 border-r shrink-0 p-4">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="w-full p-3 md:p-4 space-y-3 md:space-y-4">
            <div className="space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="space-y-4 rounded-lg border p-4 md:p-6">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-7rem)]">
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <SheetHeader className="sr-only">
            <SheetTitle>Menú de módulos</SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-4">
            <Button
              variant={!selectedModule ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => handleModuleSelect('')}
            >
              Todos
            </Button>
            {modules.map((modulo) => (
              <Button
                key={modulo}
                variant={selectedModule === modulo ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => handleModuleSelect(modulo)}
              >
                {modulo}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <div className="hidden md:block w-64 border-r shrink-0 p-4">
        <div className="space-y-4">
          <Button
            variant={!selectedModule ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => handleModuleSelect('')}
          >
            Todos
          </Button>
          {modules.map((modulo) => (
            <Button
              key={modulo}
              variant={selectedModule === modulo ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => handleModuleSelect(modulo)}
            >
              {modulo}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="shrink-0 p-2 sm:p-4 sm:pb-0">
          <Card>
            <CardContent className="p-2 sm:p-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden shrink-0"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedModule || 'Todos los artículos'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 min-h-0 p-2 sm:p-4">
          {filteredArticles.length === 0 ? (
            <Card className="border-dashed h-full">
              <CardContent className="flex flex-col items-center justify-center h-full p-4">
                <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mb-4" />
                <h2 className="text-lg sm:text-xl font-semibold text-muted-foreground mb-2 text-center">
                  No hay artículos disponibles
                </h2>
                <p className="text-sm text-muted-foreground text-center max-w-md px-4">
                  No hay artículos de ayuda para mostrar en esta sección.
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-full">
              <Card>
                <CardContent className="p-2 sm:p-4">
                  {selectedArticle && (
                    <div>
                      <h1 className="text-2xl font-bold mb-4">{selectedArticle.titulo}</h1>
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedArticle.contenido }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
