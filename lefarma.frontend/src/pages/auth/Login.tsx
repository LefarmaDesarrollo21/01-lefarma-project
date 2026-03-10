import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Lock, Mail, AlertCircle, Building } from 'lucide-react';
import logoEstatico from '@/assets/logo.png';

// Variable para controlar si se muestra el logo estático (imagen) o el animado (SVG)
const MOSTRAR_LOGO_ESTATICO = true;

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ username, password });
      navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          {/* Logo Grupo Lefarma */}
          {MOSTRAR_LOGO_ESTATICO ? (
            // Logo estático (imagen PNG)
            <div className="mb-2 flex justify-center">
              <img
                src={logoEstatico}
                alt="Grupo LeFarma"
                style={{ width: '100%', maxWidth: '400px', height: 'auto' }}
              />
            </div>
          ) : (
            // Logo animado (SVG)
            <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', display: 'block' }}>
              <svg
                viewBox="0 0 650 200"
                width="100%"
                height="auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                <style>{`
                  @keyframes lefarma-slideRight {
                    0% { opacity: 0; transform: translateX(-50px) scale(0.9); }
                    100% { opacity: 1; transform: translateX(0) scale(1); }
                  }
                  @keyframes lefarma-slideUp {
                    0% { opacity: 0; transform: translateY(40px) scale(0.9); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                  }
                  @keyframes lefarma-fadeUp {
                    0% { opacity: 0; transform: translateY(15px); }
                    100% { opacity: 1; transform: translateY(0); }
                  }
                  @keyframes lefarma-fadeRight {
                    0% { opacity: 0; transform: translateX(-20px); }
                    100% { opacity: 1; transform: translateX(0); }
                  }
                  .lefarma-blue-shape {
                    opacity: 0;
                    animation: lefarma-slideRight 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
                  }
                  .lefarma-red-shape {
                    opacity: 0;
                    animation: lefarma-slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
                  }
                  .lefarma-txt-1 {
                    opacity: 0;
                    animation: lefarma-fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1s forwards;
                  }
                  .lefarma-txt-2 {
                    opacity: 0;
                    animation: lefarma-fadeRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.3s forwards;
                  }
                  .lefarma-txt-3 {
                    opacity: 0;
                    animation: lefarma-fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.7s forwards;
                  }
                `}</style>

                {/* ICONO GEOMÉTRICO */}
                <g transform="translate(70, 30) skewX(-15)">
                  {/* Forma Roja (L) */}
                  <g className="lefarma-red-shape">
                    <path d="M 80 45 h 30 v 65 h 50 v 30 h -80 z" fill="#d2121e" />
                  </g>
                  {/* Forma Azul (G cuadrada invertida) */}
                  <g className="lefarma-blue-shape">
                    <path d="M 0 0 h 110 v 30 h -80 v 50 h 35 v 30 h -65 z" fill="#002a5c" />
                  </g>
                </g>

                {/* TEXTOS */}
                <g className="lefarma-txt-1">
                  <text
                    x="410"
                    y="70"
                    fontFamily="Georgia, 'Times New Roman', serif"
                    fontWeight="bold"
                    fontSize="48"
                    fill="#002a5c"
                    letterSpacing="5"
                    textAnchor="middle"
                  >
                    GRUPO
                  </text>
                </g>

                <g className="lefarma-txt-2">
                  <text
                    x="410"
                    y="130"
                    fontFamily="Georgia, 'Times New Roman', serif"
                    fontWeight="bold"
                    fontSize="72"
                    fill="#d2121e"
                    textAnchor="middle"
                    letterSpacing="1"
                  >
                    LEFARMA
                  </text>
                </g>

                <g className="lefarma-txt-3">
                  <text
                    x="585"
                    y="165"
                    fontFamily="'Arial Black', 'Helvetica Neue', Helvetica, sans-serif"
                    fontWeight="900"
                    fontSize="28"
                    fill="#002a5c"
                    textAnchor="end"
                    letterSpacing="-0.5"
                  >
                    Da salud
                  </text>
                </g>
              </svg>
            </div>
          )}

          <CardDescription className="mt-4">Sistema de Gestión Farmacéutica</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Seleccionar Empresa</label>
              <div className="relative">
                <Building className="absolute left-3 top-3 z-10 h-4 w-4 text-gray-400" />
                <Select value={empresa} onValueChange={setEmpresa} disabled={isLoading}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Selecciona una empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lefarma-honduras">LeFarma Honduras</SelectItem>
                    <SelectItem value="lefarma-guatemala">LeFarma Guatemala</SelectItem>
                    <SelectItem value="lefarma-el-salvador">LeFarma El Salvador</SelectItem>
                    <SelectItem value="lefarma-nicaragua">LeFarma Nicaragua</SelectItem>
                    <SelectItem value="lefarma-costa-rica">LeFarma Costa Rica</SelectItem>
                    <SelectItem value="distribuidora-central">Distribuidora Central</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Versión {import.meta.env.VITE_APP_VERSION || '1.0.0'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
