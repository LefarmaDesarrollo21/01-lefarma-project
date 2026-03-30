# Codebase Concerns

**Analysis Date:** 2026-03-30

## Tech Debt

**Large File - WorkflowDiagram.tsx:**
- Issue: 2440-line component doing too much - diagram rendering, state management, modal editing, all in one file
- Files: `lefarma.frontend/src/pages/workflows/WorkflowDiagram.tsx`
- Impact: Unmaintainable, hard to test, violates single responsibility principle
- Fix approach: Extract into components - DiagramCanvas, StepCard, ConnectionLine, StepEditorModal, ActionEditorModal, etc. Split into separate modules by responsibility

**Large File - WorkflowService.cs:**
- Issue: 956 lines with repetitive CRUD operations for workflow entities (pasos, acciones, condiciones, participantes, notificaciones)
- Files: `lefarma.backend/src/Lefarma.API/Features/Config/Workflows/WorkflowService.cs`
- Impact: Difficult to navigate, high coupling between concerns, code duplication
- Fix approach: Extract separate services for PasoService, AccionService, CondicionService, ParticipanteService, NotificacionService. Use generic CRUD base for common patterns

**Duplicate Code - AdminService.UpdateUsuarioAsync:**
- Issue: Lines 169-203 and 209-236 duplicate UsuarioDetalle property assignments
- Files: `lefarma.backend/src/Lefarma.API/Features/Admin/AdminService.cs`
- Impact: If detail properties change, must update in two places, risk of inconsistency
- Fix approach: Extract private method `MapDetalleProperties(UsuarioDetalle detalle, UsuarioDetalleRequest request)` and call it from both branches

**Task.Run Misuse:**
- Issue: Using `Task.Run` to wrap synchronous LDAP operations instead of true async pattern
- Files: `lefarma.backend/src/Lefarma.API/Services/Identity/ActiveDirectoryService.cs` (line 72)
- Impact: Unnecessary thread pool usage, blocks thread during LDAP bind operation
- Fix approach: Use native async LDAP client if available, or accept that LDAP is blocking and document it intentionally

## Known Bugs

**Placeholder Implementation - ActiveDirectoryService.GetUserAsync:**
- Symptoms: Always returns null, comments indicate it should query vwDirectorioActivo view
- Files: `lefarma.backend/src/Lefarma.API/Services/Identity/ActiveDirectoryService.cs` (lines 107-112)
- Trigger: Calling GetUserAsync always returns ErrorOr<ActiveDirectoryUser?> with null value
- Workaround: Not currently used in main auth flow (AuthenticateAsync works correctly)

**Console Logging Left in Production:**
- Symptoms: console.log and console.error statements in production frontend code
- Files: `lefarma.frontend/src/components/notifications/NotificationBell.tsx`, `NotificationList.tsx`, `RecipientSelector.tsx`, `pages/Roadmap.tsx`, `components/AutoVerify.tsx`
- Trigger: Various UI interactions and errors
- Workaround: None - logs visible in browser console
- Fix approach: Replace with proper error handling (toast notifications, error boundaries), remove console.log statements

## Security Considerations

**Development Master Password Bypass:**
- Risk: Hardcoded master password "tt01tt" allows bypassing LDAP authentication in development
- Files: `lefarma.backend/src/Lefarma.API/Features/Auth/AuthService.cs` (lines 136-142)
- Current mitigation: Check for configuration, but password is documented in code
- Recommendations: Remove master password entirely or require explicit environment variable flag to enable it. Never hardcode credentials even for dev.

**Missing Request Body Validation on Errors:**
- Risk: Request body only captured on 5xx errors, not on 4xx validation errors (malicious requests not logged)
- Files: `lefarma.backend/src/Lefarma.API/Infrastructure/Middleware/WideEventLoggingMiddleware.cs` (lines 85-100)
- Current mitigation: Logs 5xx errors with request body
- Recommendations: Consider logging suspicious 4xx patterns (repeated failures, invalid input formats) for security monitoring

**Logging Potentially Sensitive Data:**
- Risk: UserAgent truncated to 512 chars, but full header may contain sensitive info in some implementations
- Files: `lefarma.backend/src/Lefarma.API/Infrastructure/Middleware/WideEventLoggingMiddleware.cs` (line 73)
- Current mitigation: Truncation to 512 chars
- Recommendations: Review what additional data might be captured in UserAgent headers for security audit

## Performance Bottlenecks

**N+1 Queries - AdminService.GetRolWithUsuariosAsync:**
- Problem: Lines 403-410 use foreach loop to fetch each user individually from database
- Files: `lefarma.backend/src/Lefarma.API/Features/Admin/AdminService.cs` (lines 403-410)
- Cause: Fetching users one by one instead of batch query
- Improvement path: Use `.Include(u => u.UsuariosRoles).ThenInclude(ur => ur.Usuario)` or repository method `GetUsuariosByIdsAsync(List<int> ids)` for batch loading

**N+1 Queries - AdminService.GetPermisoConRelacionesAsync:**
- Problem: Lines 678-690 and 685-690 use foreach loops to fetch roles and users individually
- Files: `lefarma.backend/src/Lefarma.API/Features/Admin/AdminService.cs` (lines 678-690, 685-690)
- Cause: Fetching roles and users one by one instead of batch query
- Improvement path: Use repository batch loading methods or include patterns to load all related data in single query

**Complex Query Joins - WorkflowService:**
- Problem: Lines 28-31 and 60-64 repeatedly load entire workflow graph with deeply nested includes (Pasos → Acciones → Notificaciones, Condiciones, Participantes)
- Files: `lefarma.backend/src/Lefarma.API/Features/Config/Workflows/WorkflowService.cs`
- Cause: Loading complete workflow hierarchy for every operation
- Improvement path: Consider projection queries that only load needed fields, or implement query splitting with AsNoTracking for read operations. Cache frequently accessed workflows.

**Missing Query Optimization Indicators:**
- Problem: No AsNoTracking() usage observed in repository Include patterns (grep search returned only Include/ThenInclude)
- Files: `lefarma.backend/src/Lefarma.API/Infrastructure/Data/Repositories/` (various files)
- Cause: EF Core tracks all entities even for read-only operations
- Improvement path: Add `.AsNoTracking()` to read-only queries (GetAll, GetById, list operations) for better performance and memory usage

## Fragile Areas

**Workflow Frontend Editor:**
- Files: `lefarma.frontend/src/pages/workflows/WorkflowDiagram.tsx`
- Why fragile: 2440 lines mixing diagram rendering, state management, modal editing, and multiple entity types. Changes risk breaking unrelated functionality.
- Safe modification: Extract components incrementally - start with StepCard, ConnectionLine, then editor modals. Test diagram rendering after each extraction.
- Test coverage: No tests found for workflow editor - high risk of regressions

**AdminService - User/Rol/Permiso Assignment Logic:**
- Files: `lefarma.backend/src/Lefarma.API/Features/Admin/AdminService.cs`
- Why fragile: Multiple assignment methods (AsignarRolesAUsuarioAsync, AsignarPermisosAUsuarioAsync, etc.) with potential for inconsistent state. UpdateUsuarioAsync combines user + roles + permissions + detalle updates in one transaction.
- Safe modification: Add integration tests that verify complete assignment workflows. Use database transactions explicitly for multi-entity updates.
- Test coverage: Unit tests exist but integration tests for complete assignment flows missing

**Notification Delivery Channels:**
- Files: `lefarma.backend/src/Lefarma.API/Features/Notifications/Services/Channels/`
- Why fragile: Multiple notification channels (Email, WhatsApp, Telegram) with different error handling and retry logic. Failures in one channel could affect others.
- Safe modification: Add comprehensive retry policies and circuit breakers. Log all channel failures with sufficient detail for debugging.
- Test coverage: Found only 3 notification test files - insufficient coverage for all channel failure scenarios

## Scaling Limits

**Workflow Query Performance:**
- Current capacity: Unknown, but nested includes suggest exponential query time growth with workflow complexity
- Limit: Likely degrades with workflows having 20+ steps with multiple actions each
- Scaling path: Implement query splitting, use AsNoTracking, consider caching workflow definitions, add pagination for large result sets

**File Upload/Archive Repository:**
- Current capacity: Not analyzed in depth
- Limit: Depends on blob storage configuration, database row limits for metadata
- Scaling path: Ensure large files stored in blob storage (not database), implement streaming uploads, add file size limits and quotas

**Notification Queue:**
- Current capacity: Not visible from code inspection (likely in-memory queue or missing)
- Limit: In-memory queues limited by server memory, lost on restart
- Scaling path: Implement persistent queue (RabbitMQ, Azure Service Bus, Azure Queue Storage), add monitoring for queue depth, implement dead-letter queues

## Dependencies at Risk

**System.DirectoryServices.Protocols:**
- Risk: Cross-platform LDAP support but limited documentation and community examples
- Impact: LDAP authentication is critical for the application
- Migration plan: Consider alternative like Novell.Directory.Ldap.LDAP or commercial LDAP SDKs with better cross-platform support

**Email Sending via MailKit:**
- Risk: EmailNotificationChannel uses MailKit but SMTP configuration must be properly secured
- Impact: Notification system depends on email delivery
- Migration plan: None needed, but ensure SMTP credentials are in environment variables, not hardcoded. Consider using email service (SendGrid, Mailgun) for better deliverability tracking

## Missing Critical Features

**Workflow Versioning:**
- Problem: Workflows have Version field but no migration or rollback logic visible
- Blocks: Cannot safely update workflow definitions without risk to active processes
- Implementation needed: Version history table, migration script to update active process instances, rollback UI

**Workflow Instance Tracking:**
- Problem: WorkflowEngine exists but no persistent tracking of workflow instances (what process is at what step)
- Blocks: Cannot resume interrupted workflows, cannot audit workflow execution history, cannot report on workflow metrics
- Implementation needed: WorkflowInstance entity tracking each process through workflow steps with timestamps and state

**Frontend E2E Tests:**
- Problem: No frontend E2E tests found (Playwright configured but 0 test files)
- Blocks: Cannot verify critical user workflows end-to-end, high risk of regressions in UI changes
- Implementation needed: Add Playwright tests for auth flow, workflow editor, notification viewing, admin CRUD operations

## Test Coverage Gaps

**Backend Service Layer:**
- What's not tested: Integration tests for service methods, error handling paths, concurrent updates
- Files: `lefarma.backend/tests/` - Only 14 test files for 334 source files (~4% coverage)
- Risk: Business logic errors could reach production, edge cases untested
- Priority: High

**Frontend Components:**
- What's not tested: All frontend components - 0 test files found for 162 TypeScript files
- Files: `lefarma.frontend/src/` - No .test.ts or .test.tsx files
- Risk: UI regressions, component refactoring breaks functionality, state management bugs
- Priority: High

**Workflow Engine:**
- What's not tested: WorkflowEngine logic, state transitions, condition evaluation, participant assignment
- Files: `lefarma.backend/src/Lefarma.API/Features/Config/Engine/WorkflowEngine.cs`
- Risk: Workflow execution errors, wrong routing logic, permissions bypass
- Priority: High

**Notification Channels:**
- What's not tested: Email delivery, WhatsApp API integration, Telegram API integration, retry logic
- Files: `lefarma.backend/src/Lefarma.API/Features/Notifications/Services/Channels/`
- Risk: Notification failures, delivery errors not detected, incorrect message formatting
- Priority: Medium

**Admin Assignment Logic:**
- What's not tested: Complete user creation with roles, role permission updates, permission-to-user assignment
- Files: `lefarma.backend/src/Lefarma.API/Features/Admin/AdminService.cs`
- Risk: Permission inconsistencies, role assignment failures, authorization bypass
- Priority: Medium

---

*Concerns audit: 2026-03-30*
