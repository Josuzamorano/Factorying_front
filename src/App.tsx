import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from './context/AuthContext';
import { ThemeContextProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/autenticacion/Login';
import Principal from './pages/autenticacion/Principal';
import Mantenimiento from './pages/mantenimiento/Mantenimiento';
import Bancos from './pages/mantenimiento/Bancos';
import Plazas from './pages/mantenimiento/Plazas';
import Sucursales from './pages/mantenimiento/Sucursales';
import Parametros from './pages/mantenimiento/Parametros';
import Gastos from './pages/mantenimiento/Gastos';
import Usuarios from './pages/mantenimiento/Usuarios';
import Ejecutivos from './pages/mantenimiento/Ejecutivos';
import Tesoreria from './pages/tesoreria/Tesoreria';
import Movimientos from './pages/tesoreria/Movimientos';
import Giros from './pages/tesoreria/Giros';
import Arqueo from './pages/tesoreria/Arqueo';

// Módulo 2: Clientes
import Clientes from './pages/clientes/Clientes';
import ClienteForm from './pages/clientes/ClienteForm';

// Módulo 3: Deudores
import Deudores from './pages/deudores/Deudores';
import DeudorForm from './pages/deudores/DeudorForm';
import GrupoDeudores from './components/deudores/GrupoDeudores';

// Módulo 4: Operaciones
import Operaciones from './pages/operaciones/Operaciones';
import OperacionForm from './pages/operaciones/OperacionForm';

// Módulo 6: Recaudación/Gestión de Cobranza
import Recaudacion from './pages/recaudacion/Recaudacion';
import GestionCobranza from './pages/recaudacion/GestionCobranza';
import EstadosCobranza from './pages/recaudacion/EstadosCobranza';
import DeudaTotalCliente from './pages/recaudacion/DeudaTotalCliente';

// Módulo 7: Cobranza
import Cobranza from './pages/cobranza/Cobranza';
import PagoDeudor from './pages/cobranza/PagoDeudor';
import VerificacionDocumentos from './pages/cobranza/VerificacionDocumentos';
import Caja from './pages/cobranza/Caja';
import VerificacionDiaria from './pages/cobranza/VerificacionDiaria';
import DocumentosNoCedidos from './pages/cobranza/DocumentosNoCedidos';
import ConsultaMasiva from './pages/cobranza/ConsultaMasiva';

// Módulo 8: Comercial
import Comercial from './pages/comercial/Comercial';
import Excedentes from './pages/comercial/Excedentes';
import Prorrogas from './pages/comercial/Prorrogas';
import CartolaCliente from './pages/comercial/CartolaCliente';
import Renovaciones from './pages/comercial/Renovaciones';
import InformeDocumentosCliente from './pages/comercial/InformeDocumentosCliente';

// Módulo 9: Líneas de Crédito
import LineasCredito from './pages/lineas-credito/LineasCredito';
import GestionLineas from './pages/lineas-credito/GestionLineas';
import AprobacionLineas from './pages/lineas-credito/AprobacionLineas';
import ConsultaEndeudamiento from './pages/lineas-credito/ConsultaEndeudamiento';
import SublineaProducto from './pages/lineas-credito/SublineaProducto';
import SublineaDeudor from './pages/lineas-credito/SublineaDeudor';

// Módulo 11: Finanzas
import Finanzas from './pages/finanzas/Finanzas';
import TasasPlazos from './pages/finanzas/TasasPlazos';
import SimuladorTasas from './pages/finanzas/SimuladorTasas';
import TasasBases from './pages/finanzas/TasasBases';
import IndicadoresEconomicos from './pages/finanzas/IndicadoresEconomicos';

// Módulo 12: Informes
import Informes from './pages/informes/Informes';
import InformesDashboard from './pages/informes/InformesDashboard';
import InformeAnticipos from './pages/informes/InformeAnticipos';
import InformeVolumenOperaciones from './pages/informes/InformeVolumenOperaciones';
import InformeConcentracionTerceros from './pages/informes/InformeConcentracionTerceros';
import InformeProtestosDiarios from './pages/informes/InformeProtestosDiarios';
import InformeDocumentosDeudor from './pages/informes/InformeDocumentosDeudor';
import InformeCarteraCliente from './pages/informes/InformeCarteraCliente';
import InformeDevengamiento from './pages/informes/InformeDevengamiento';
import InformeAdelantos from './pages/informes/InformeAdelantos';
import InformeCupoCliente from './pages/informes/InformeCupoCliente';
import InformeExcedentes from './pages/informes/InformeExcedentes';

// Módulo 13: Legal
import Legal from './pages/legal/Legal';
import LegalDashboard from './pages/legal/LegalDashboard';
import Pagares from './pages/legal/Pagares';
import Avales from './pages/legal/Avales';
import Firmas from './pages/legal/Firmas';
import ContratoGlobal from './pages/legal/ContratoGlobal';
import EmisionPagare from './pages/legal/EmisionPagare';

// El tema ahora se maneja dinámicamente en ThemeContext
// Colores de branding global (configurables por admin)

/**
 * Componente placeholder para módulos pendientes de implementar
 */
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <h1>{title}</h1>
      <p>Módulo en desarrollo...</p>
      <a href="/principal" style={{ marginTop: 20 }}>
        Volver al menú principal
      </a>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeContextProvider>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Ruta pública: Login */}
              <Route path="/login" element={<Login />} />

            {/* Ruta protegida: Principal */}
            <Route
              path="/principal"
              element={
                <ProtectedRoute>
                  <Principal />
                </ProtectedRoute>
              }
            />

            {/* Rutas de Mantenimiento */}
            <Route
              path="/mantenimiento"
              element={
                <ProtectedRoute>
                  <Mantenimiento />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mantenimiento/bancos"
              element={
                <ProtectedRoute>
                  <Bancos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mantenimiento/plazas"
              element={
                <ProtectedRoute>
                  <Plazas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mantenimiento/sucursales"
              element={
                <ProtectedRoute>
                  <Sucursales />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mantenimiento/ejecutivos"
              element={
                <ProtectedRoute>
                  <Ejecutivos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mantenimiento/parametros"
              element={
                <ProtectedRoute>
                  <Parametros />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mantenimiento/usuarios"
              element={
                <ProtectedRoute>
                  <Usuarios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mantenimiento/perfiles"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Perfiles" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mantenimiento/comunas"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Comunas" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mantenimiento/gastos"
              element={
                <ProtectedRoute>
                  <Gastos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operaciones"
              element={
                <ProtectedRoute>
                  <Operaciones />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operaciones/nueva"
              element={
                <ProtectedRoute>
                  <OperacionForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operaciones/:id"
              element={
                <ProtectedRoute>
                  <OperacionForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operaciones/:id/editar"
              element={
                <ProtectedRoute>
                  <OperacionForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/consultas"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Consultas" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reportes"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Reportes" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documentos"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Documentos" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cobranza"
              element={
                <ProtectedRoute>
                  <Cobranza />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cobranza/pago-deudor"
              element={
                <ProtectedRoute>
                  <PagoDeudor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cobranza/pago-cliente"
              element={
                <ProtectedRoute>
                  <PagoDeudor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cobranza/verificacion"
              element={
                <ProtectedRoute>
                  <VerificacionDocumentos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cobranza/caja"
              element={
                <ProtectedRoute>
                  <Caja />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cobranza/verificacion-diaria"
              element={
                <ProtectedRoute>
                  <VerificacionDiaria />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cobranza/dnc"
              element={
                <ProtectedRoute>
                  <DocumentosNoCedidos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cobranza/consulta-masiva"
              element={
                <ProtectedRoute>
                  <ConsultaMasiva />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cobranza/informe-abonos"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Informe Abonos" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recaudacion"
              element={
                <ProtectedRoute>
                  <Recaudacion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recaudacion/gestion"
              element={
                <ProtectedRoute>
                  <GestionCobranza />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recaudacion/estados"
              element={
                <ProtectedRoute>
                  <EstadosCobranza />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recaudacion/deuda-total"
              element={
                <ProtectedRoute>
                  <DeudaTotalCliente />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recaudacion/cobradores"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Cobradores" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recaudacion/asignacion"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Asignación Cobradores" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recaudacion/cobranza-diaria"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Cobranza Diaria" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recaudacion/cartas"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Cartas Notificación" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recaudacion/agenda"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Agenda Gestión" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tesoreria"
              element={
                <ProtectedRoute>
                  <Tesoreria />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tesoreria/movimientos"
              element={
                <ProtectedRoute>
                  <Movimientos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tesoreria/giros"
              element={
                <ProtectedRoute>
                  <Giros />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tesoreria/pagos"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Pagos" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tesoreria/arqueo"
              element={
                <ProtectedRoute>
                  <Arqueo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tesoreria/colilla"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Colilla Depósito" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tesoreria/protestos"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Protestos" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contabilidad"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Contabilidad" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes"
              element={
                <ProtectedRoute>
                  <Clientes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes/nuevo"
              element={
                <ProtectedRoute>
                  <ClienteForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes/:rut"
              element={
                <ProtectedRoute>
                  <ClienteForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes/:rut/editar"
              element={
                <ProtectedRoute>
                  <ClienteForm />
                </ProtectedRoute>
              }
            />

            {/* Rutas de Deudores - Módulo 3 */}
            <Route
              path="/deudores"
              element={
                <ProtectedRoute>
                  <Deudores />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deudores/nuevo"
              element={
                <ProtectedRoute>
                  <DeudorForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deudores/:rutCliente/:rutDeudor"
              element={
                <ProtectedRoute>
                  <DeudorForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deudores/grupos"
              element={
                <ProtectedRoute>
                  <GrupoDeudores />
                </ProtectedRoute>
              }
            />

            <Route
              path="/facturas"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Facturas" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pagares"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Pagarés" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cartera"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Cartera" />
                </ProtectedRoute>
              }
            />

            {/* Rutas de Comercial - Módulo 8 */}
            <Route
              path="/comercial"
              element={
                <ProtectedRoute>
                  <Comercial />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comercial/excedentes"
              element={
                <ProtectedRoute>
                  <Excedentes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comercial/documentos"
              element={
                <ProtectedRoute>
                  <InformeDocumentosCliente />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comercial/prorroga"
              element={
                <ProtectedRoute>
                  <Prorrogas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comercial/aprobacion-prorrogas"
              element={
                <ProtectedRoute>
                  <Prorrogas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comercial/renovacion"
              element={
                <ProtectedRoute>
                  <Renovaciones />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comercial/otorgamiento"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Consulta Otorgamiento" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comercial/pizarra"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Pizarra Comercial" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comercial/cartola"
              element={
                <ProtectedRoute>
                  <CartolaCliente />
                </ProtectedRoute>
              }
            />

            {/* Rutas de Líneas de Crédito - Módulo 9 */}
            <Route
              path="/lineas-credito"
              element={
                <ProtectedRoute>
                  <LineasCredito />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lineas-credito/gestion"
              element={
                <ProtectedRoute>
                  <GestionLineas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lineas-credito/aprobacion"
              element={
                <ProtectedRoute>
                  <AprobacionLineas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lineas-credito/endeudamiento"
              element={
                <ProtectedRoute>
                  <ConsultaEndeudamiento />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lineas-credito/sublinea-producto"
              element={
                <ProtectedRoute>
                  <SublineaProducto />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lineas-credito/sublinea-deudor"
              element={
                <ProtectedRoute>
                  <SublineaDeudor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lineas-credito/por-vencer"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Líneas Por Vencer" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lineas-credito/vencidas"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Líneas Vencidas" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lineas-credito/informe"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Informe Líneas" />
                </ProtectedRoute>
              }
            />

            {/* Rutas de Finanzas - Módulo 11 */}
            <Route
              path="/finanzas"
              element={
                <ProtectedRoute>
                  <Finanzas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finanzas/tasas"
              element={
                <ProtectedRoute>
                  <TasasPlazos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finanzas/simulador"
              element={
                <ProtectedRoute>
                  <SimuladorTasas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finanzas/historico"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Histórico Tasas" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finanzas/indicadores"
              element={
                <ProtectedRoute>
                  <IndicadoresEconomicos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finanzas/tasas-bases"
              element={
                <ProtectedRoute>
                  <TasasBases />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finanzas/copiar"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Copiar Tasas" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finanzas/resumen"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Resumen Tasas" />
                </ProtectedRoute>
              }
            />

            {/* Rutas de Informes - Módulo 12 */}
            <Route
              path="/informes"
              element={
                <ProtectedRoute>
                  <Informes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/informes/dashboard"
              element={
                <ProtectedRoute>
                  <InformesDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/informes/anticipos"
              element={
                <ProtectedRoute>
                  <InformeAnticipos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/informes/protestos"
              element={
                <ProtectedRoute>
                  <InformeProtestosDiarios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/informes/documentos-deudor"
              element={
                <ProtectedRoute>
                  <InformeDocumentosDeudor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/informes/cartera"
              element={
                <ProtectedRoute>
                  <InformeCarteraCliente />
                </ProtectedRoute>
              }
            />
            <Route
              path="/informes/devengamiento"
              element={
                <ProtectedRoute>
                  <InformeDevengamiento />
                </ProtectedRoute>
              }
            />
            <Route
              path="/informes/adelantos"
              element={
                <ProtectedRoute>
                  <InformeAdelantos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/informes/cupo-cliente"
              element={
                <ProtectedRoute>
                  <InformeCupoCliente />
                </ProtectedRoute>
              }
            />
            <Route
              path="/informes/volumen"
              element={
                <ProtectedRoute>
                  <InformeVolumenOperaciones />
                </ProtectedRoute>
              }
            />
            <Route
              path="/informes/excedentes"
              element={
                <ProtectedRoute>
                  <InformeExcedentes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/informes/concentracion"
              element={
                <ProtectedRoute>
                  <InformeConcentracionTerceros />
                </ProtectedRoute>
              }
            />
            <Route
              path="/informes/historial"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Historial de Informes" />
                </ProtectedRoute>
              }
            />

            {/* Rutas de Legal - Módulo 13 */}
            <Route
              path="/legal"
              element={
                <ProtectedRoute>
                  <Legal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/legal/dashboard"
              element={
                <ProtectedRoute>
                  <LegalDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/legal/pagares"
              element={
                <ProtectedRoute>
                  <Pagares />
                </ProtectedRoute>
              }
            />
            <Route
              path="/legal/avales"
              element={
                <ProtectedRoute>
                  <Avales />
                </ProtectedRoute>
              }
            />
            <Route
              path="/legal/firmas"
              element={
                <ProtectedRoute>
                  <Firmas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/legal/contratos"
              element={
                <ProtectedRoute>
                  <ContratoGlobal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/legal/emision-pagare"
              element={
                <ProtectedRoute>
                  <EmisionPagare />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pagos"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Pagos" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/estadisticas"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Estadísticas" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/administracion"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Administración" />
                </ProtectedRoute>
              }
            />

            {/* Redirección por defecto */}
            <Route path="/" element={<Navigate to="/principal" replace />} />
            <Route path="*" element={<Navigate to="/principal" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      </SnackbarProvider>
    </ThemeContextProvider>
  );
};

export default App;
