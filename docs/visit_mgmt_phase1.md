# Visitor Data Management Phase 1 Implementation Plan

## Overview
This plan addresses two key requirements for visitor data management:

1. **VisitCard Enhancement**: Display the count of unsynced visitor data associated with each visit
2. **Sync Data Screen Enhancement**: Show visitor data in the local changes section and ensure it gets synced

## Current State Analysis

### Database Structure
- **visits** table: Stores visit information with `change_type` field indicating sync status
- **tree_images** table: Stores visitor data with types:
  - `user_tree_image`: Tree images captured during visits
  - `user_card_image`: User card images captured during visits
  - `is_uploaded` field tracks sync status
- **visit_images** table: Stores images specifically associated with visits

### Current Sync Screen Display
- Users: Add/Edit/Delete counts
- Trees: Add/Edit/Delete counts
- Tree Images: Add/Delete counts (from tree_snapshots)
- Visit Images: Add/Delete counts (currently commented out)

## Implementation Plan

### Phase 1.1: Database Layer Enhancements

#### 1. Add Visitor Data Count Method to TreeImagesDao
**File**: `/src/services/db/tree_images.ts`
- Add `countVisitorImages(isUploaded?: boolean)` method
- Query: `SELECT type, COUNT(*) as count FROM tree_images WHERE type IN ('user_tree_image', 'user_card_image') AND is_uploaded = ? GROUP BY type`

### Phase 1.2: VisitCard Component Update

#### 1. Add Visitor Data Count Display
**File**: `/src/components/visit/VisitCard.tsx`
- Import necessary dependencies for database access
- Add state to store visitor data count
- Add useEffect to fetch count when component mounts
- Add text display showing "X unsynced visitor data entries"
- Position it appropriately in the card layout

#### 2. Fetch Visitor Data Count Logic
- Use DaoClient to query tree_images table
- Filter by visit association (may need to link via sapling_id or add visit_id to tree_images table)
- Count unsynced entries (is_uploaded = 0)

### Phase 1.3: Sync Data Screen Update

#### 1. Add Visitor Data Section
**File**: `/src/screens/Sync.tsx`
- Add state variables for visitor data counts
- Add fetch logic for visitor data counts in `setPendingUploadCounts()` function
- Add UI section to display visitor data counts
- Separate from existing tree images section (user_tree_image vs tree_snapshot images)
- Add to pending count and upload time calculations

#### 2. Update Sync Logic
- Ensure visitor data is included in sync upload process
- Update sync info tracking to include visitor data counts

### Phase 1.4: Sync Service Updates

#### 1. Update Sync Info Structure
**File**: `/src/screens/Sync.tsx`
- Add `visitor_data` fields to syncDetailsTemplate
- Update all related functions to handle visitor data counts

#### 2. Update Upload Process
- Ensure visitor data is uploaded during sync
- Update progress tracking to include visitor data

## Technical Considerations

### Database Schema Considerations
- Visitor data is currently linked to saplings, not directly to visits
- May need to add `visit_id` field to `tree_images` table for better association
- Consider performance impact of count queries on large datasets

### UI/UX Considerations
- Ensure count displays are clear and non-intrusive
- Maintain consistent styling with existing components
- Handle loading states for count fetches
- Consider real-time updates when visitor data is added

### Performance Considerations
- Implement efficient count queries
- Consider caching counts to avoid frequent database hits
- Optimize sync process to handle large amounts of visitor data

## Implementation Steps

1. **Database Layer** (Priority: High)
   - Add count methods to DAOs
   - Test query performance

2. **VisitCard Enhancement** (Priority: Medium)
   - Implement count display
   - Add loading states
   - Test with various data scenarios

3. **Sync Screen Enhancement** (Priority: High)
   - Add visitor data sections
   - Update sync logic
   - Test sync process with visitor data

4. **Testing** (Priority: High)
   - Test with empty data
   - Test with large datasets
   - Test sync functionality
   - Test UI responsiveness

## Risk Assessment

### Low Risk
- Adding count display to VisitCard
- Adding sections to Sync screen

### Medium Risk
- Database query performance with large datasets
- Sync process modifications

### Mitigation Strategies
- Implement efficient queries with proper indexing
- Thorough testing of sync process
- Gradual rollout with feature flags if possible

## Success Criteria

1. VisitCard shows accurate count of unsynced visitor data
2. Sync Data screen displays visitor data counts
3. Sync process correctly handles visitor data upload
4. No performance degradation in existing functionality
5. UI remains consistent and user-friendly

## Next Steps

After plan review and approval:
1. Start with Database Layer Enhancements
2. Implement VisitCard changes
3. Update Sync Data screen
4. Comprehensive testing
5. Deployment and monitoring