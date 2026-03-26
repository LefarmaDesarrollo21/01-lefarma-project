import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('debería hacer login con usuario 54 y capturar logs', async ({ page }) => {
    // Coleccionar todos los logs de consola
    const logs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      logs.push(`[${msg.type()}] ${text}`);
    });

    // Navegar a la página de login
    await page.goto('http://localhost:5173/', {
      waitUntil: 'networkidle',
    });

    // Esperar a que la página cargue
    await expect(page.locator('input[type="text"]')).toBeVisible();

    console.log('🔍 Paso 1: Ingresando usuario...');
    // PASO 1: Ingresar usuario
    await page.fill('input[type="text"]', '54');
    await page.click('button[type="submit"]');

    // Esperar a que aparezca el input de password
    await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 5000 });

    console.log('🔍 Paso 2: Ingresando password...');
    // PASO 2: Ingresar password
    await page.fill('input[type="password"]', 'tt01tt');
    await page.click('button[type="submit"]');

    // Esperar 3 segundos para ver los logs de SSE
    console.log('⏳ Esperando 3 segundos para capturar logs de SSE...');
    await page.waitForTimeout(3000);

    // Imprimir todos los logs capturados
    console.log('\n📋 LOGS DE CONSOLA CAPTURADOS:');
    console.log('='.repeat(80));
    for (const log of logs) {
      // Filtrar logs relevantes (notificaciones, SSE, errores)
      if (
        log.includes('SSE') ||
        log.includes('notification') ||
        log.includes('Notification') ||
        log.includes('error') ||
        log.includes('Error')
      ) {
        console.log(log);
      }
    }
    console.log('='.repeat(80));

    // Verificar que no haya errores críticos
    const errorLogs = logs.filter(log =>
      log.toLowerCase().includes('error') &&
      !log.includes('DevTools') &&
      !log.includes('Download the React DevTools')
    );

    if (errorLogs.length > 0) {
      console.log('\n❌ ERRORES ENCONTRADOS:');
      errorLogs.forEach(log => console.log(`  ${log}`));
    } else {
      console.log('\n✅ No se encontraron errores críticos');
    }

    // Buscar el bucle infinito de SSE
    const sseConnectLogs = logs.filter(log => log.includes('SSE') && log.includes('Conectando'));
    const sseDisconnectLogs = logs.filter(log => log.includes('SSE') && log.includes('Desconectando'));

    console.log(`\n📊 ESTADÍSTICAS DE SSE:`);
    console.log(`  Conexiones: ${sseConnectLogs.length}`);
    console.log(`  Desconexiones: ${sseDisconnectLogs.length}`);

    if (sseConnectLogs.length > 3) {
      console.log('\n⚠️  POSIBLE BUCLE INFINITO DETECTADO:');
      console.log(`  Se detectaron ${sseConnectLogs.length} intentos de conexión en 3 segundos`);
    } else {
      console.log('\n✅ No hay bucle infinito de SSE');
    }

    // Verificar el estado de autenticación
    const currentUrl = page.url();
    console.log(`\n🌐 URL actual: ${currentUrl}`);

    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Login exitoso - Usuario redirigido al dashboard');
    } else if (currentUrl.includes('/login')) {
      console.log('⚠️  Login no completado - Usuario aún en página de login');
    }
  });
});
