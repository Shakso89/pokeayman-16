
// Export all functionality from the refactored modules
export * from "./types";
export * from "./mappers";
export * from "./errorHandling";
export * from "./classSubscription";
export * from "./classFetching";
export * from "./classOperations";
export * from "./studentOperations";

// Initialize realtime subscriptions when this module is imported
import { enableRealtimeForTables } from "./classSubscription";
enableRealtimeForTables();
