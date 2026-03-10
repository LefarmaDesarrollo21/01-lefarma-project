import { Routes, Route } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { MainLayout } from '@/components/layout/MainLayout';

// Pages
import Login from '@/pages/auth/Login';
import Dashboard from '@/pages/Dashboard';
import RolesList from '@/pages/catalogos/Roles/RolesList';
import PermisosList from '@/pages/catalogos/Permisos/PermisosList';
import ConfiguracionGeneral from '@/pages/configuracion/ConfiguracionGeneral';
import Perfil from '@/pages/Perfil';
import Roadmap from '@/pages/Roadmap';
import DemoComponents from '@/pages/DemoComponents';
import NotFound from '@/pages/NotFound';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/demo-components" element={<DemoComponents />} />
        <Route path="/roadmap" element={<Roadmap />} />

        {/* demo de momenot */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/roles" element={<RolesList />} />
          <Route path="/permisos" element={<PermisosList />} />
          <Route path="/configuracion" element={<ConfiguracionGeneral />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/demo-components" element={<DemoComponents />} />
        </Route>
      </Route>

      {/* Rutas Protegidas */}
      <Route element={<PrivateRoute />}>
        {/* Rutas con layout principal */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/roles" element={<RolesList />} />
          <Route path="/permisos" element={<PermisosList />} />
          <Route path="/configuracion" element={<ConfiguracionGeneral />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/demo-components" element={<DemoComponents />} />
        </Route>
      </Route>

      {/* 404 - Debe estar al final */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
