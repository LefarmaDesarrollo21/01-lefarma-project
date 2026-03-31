# Plan: Fix Sidebar Header in Dark Mode

## Goal
Fix the sidebar header to display white text in dark mode and replace the Building2 icon with the LeFarma logo (.ico file).

## Tasks

### 1. Update AppSidebar Header Styling and Logo

**File**: `lefarma.frontend/src/components/layout/AppSidebar.tsx`

**Changes**:
- Replace the `Building2` icon with an `img` tag pointing to the logo.ico file
- Update text colors to ensure white display in dark mode using `text-white` or proper theme-aware classes
- Test both light and dark mode to verify contrast

**Specific modifications**:
- Lines 224-226: Replace `<Building2>` icon with `<img src="/favicon.ico" alt="LeFarma" className="h-5 w-5" />`
- Line 228: Ensure "LeFarma" text uses `text-white` or theme-aware color
- Line 229: Ensure version text uses proper color for dark mode visibility

## Acceptance Criteria
- ✅ Sidebar header displays the LeFarma logo (.ico) instead of Building2 icon
- ✅ All text in sidebar header is white and clearly visible in dark mode
- ✅ Styling remains consistent in light mode
- ✅ No breaking changes to sidebar functionality
