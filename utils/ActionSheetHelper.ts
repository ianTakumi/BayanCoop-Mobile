import { ActionSheetRef } from "@/types/actionSheet";

class ActionSheetHelper {
  private static actionSheetRef: ActionSheetRef | null = null;

  static setActionSheetRef(ref: ActionSheetRef | null): void {
    this.actionSheetRef = ref;
  }

  static showActionSheet(config: {
    title?: string;
    options: string[];
    cancelButtonIndex: number;
    destructiveButtonIndex?: number;
    onPress: (index: number) => void;
  }): void {
    if (this.actionSheetRef) {
      this.actionSheetRef.show(config);
    }
  }

  static showLogoutConfirmation(onConfirm: () => void): void {
    this.showActionSheet({
      title: "Confirm Logout",
      options: ["Logout", "Cancel"],
      cancelButtonIndex: 1,
      destructiveButtonIndex: 0,
      onPress: (index: number) => {
        if (index === 0) {
          onConfirm();
        }
      },
    });
  }

  static showConfirmation(
    title: string,
    confirmText: string,
    onConfirm: () => void,
    destructive: boolean = true
  ): void {
    this.showActionSheet({
      title: title,
      options: [confirmText, "Cancel"],
      cancelButtonIndex: 1,
      destructiveButtonIndex: destructive ? 0 : undefined,
      onPress: (index: number) => {
        if (index === 0) {
          onConfirm();
        }
      },
    });
  }

  static showOptions(
    title: string,
    options: string[],
    onSelect: (index: number) => void
  ): void {
    this.showActionSheet({
      title: title,
      options: [...options, "Cancel"],
      cancelButtonIndex: options.length,
      onPress: onSelect,
    });
  }

  static showDeleteConfirmation(onConfirm: () => void): void {
    this.showConfirmation("Confirm Delete", "Delete", onConfirm, true);
  }
}

export default ActionSheetHelper;
