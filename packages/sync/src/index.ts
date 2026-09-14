import type { SyncOperation } from "@plataforma/domain";

export class SyncQueue {
  private readonly operations: SyncOperation[] = [];

  enqueue(operation: SyncOperation): void {
    if (this.operations.some((item) => item.id === operation.id)) return;
    this.operations.push(operation);
  }

  pending(): SyncOperation[] {
    return [...this.operations];
  }

  acknowledge(operationId: string): void {
    const index = this.operations.findIndex((item) => item.id === operationId);
    if (index >= 0) this.operations.splice(index, 1);
  }
}
