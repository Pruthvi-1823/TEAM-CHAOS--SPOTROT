# Security Specification for SpotRot

## Data Invariants
1. A **Scan** must be associated with a valid **Batch**.
2. A **Scan** must have a `spoilageScore` between 0 and 10.
3. Users can only write data if they are authenticated and their email is verified.
4. **Batches** and **Scans** once created should have immutable `createdBy` or `scannedBy` fields.

## The Dirty Dozen Payloads (Targeting Rejection)

1. **Identity Spoofing (Batch)**: Creating a batch with a `createdBy` field that isn't the sender's UID.
2. **Resource Poisoning (Scan)**: Injecting a 2MB string into `analysisNotes`.
3. **State Shortcutting**: Updating a batch from `status: 'active'` to `status: 'completed'` when the user is not the owner.
4. **Invalid Range (Score)**: Setting `spoilageScore` to 11 (out of 10).
5. **Type Poisoning**: Setting `timestamp` as a Boolean instead of a Timestamp.
6. **Orphaned Write**: Creating a **Scan** for a `batchId` that does not exist.
7. **PII Leak**: Attempting to read all user profiles (if we had a users collection, but here we restrict reads to project members).
8. **Shadow Update**: Adding a field `isVerifiedByAI: true` to a batch update by a standard user.
9. **Timestamp Spoofing**: Providing a `createdAt` in the past instead of using `request.time`.
10. **ID Injection**: Using a 1KB string as a document ID.
11. **Verified Only**: Writing as a user with `email_verified: false`.
12. **Blanket Read**: Querying all scans without filtering by batch or location constraints (enforced in rules).

## Test Runner (Logic)
All the above payloads MUST return `PERMISSION_DENIED`.
