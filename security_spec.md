# Security Specifications for Mueen Yemen

## Data Invariants
1. A user can only write their own profile and private info.
2. A job must have a valid `clientId` matching the requester.
3. Only the `clientId` or `providerId` of a job can read the associated chat.
4. Messages must be sent by a participant of the chat.
5. KYC data (`/users/{userId}/private/info`) is ONLY readable by the owner or an admin.
6. Public profile data is readable by all signed-in users.

## The "Dirty Dozen" Payloads

1. **Privilege Escalation**: Attempt to create a user profile with `role: "admin"` as a regular user.
2. **KYC Scraping**: Attempt to read `/users/targetUserId/private/info` as a different user.
3. **Ghost Job**: Create a job with `clientId: "otherUserUid"`.
4. **Unauthorized Move**: A client attempts to update a job's `status` to `completed` without the provider's consent (or vice-versa, depending on flow).
5. **Chat Eavesdropping**: Attempt to read `/chats/chatId` without being in the `participants` list.
6. **Message Spoofing**: Send a message with `senderId: "notMyUid"`.
7. **Resource Exhaustion**: Send a job `description` longer than 50KB.
8. **ID Poisoning**: Create a job with a path variable `jobId` that is 500 characters long.
9. **State Shortcutting**: Update a job from `pending` directly to `completed` (skipping `active`).
10. **Shadow Key Update**: Attempt to add `isVerified: true` to a user profile update.
11. **Relational Sync Break**: Delete a user profile while they have active jobs.
12. **PII Leak**: Query the `users` collection filtered by `phone` (if phone was in public profile).

## Test Runner (Draft)
The `firestore.rules` will be validated against these scenarios.
